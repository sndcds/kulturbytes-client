import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, reactive, ref, Suspense, watch, type WatchSource } from 'vue'
import RegionPage from '../../app/pages/events/[country]/[state]/[region]/index.vue'
import { api } from './nuxt'

describe('regional event pagination', () => {
  let wrapper: VueWrapper | undefined
  let route: {
    params: { country: string, state: string, region: string }
    query: Record<string, string>
    fullPath: string
  }
  let responseCount: number
  let cursorAvailable: boolean
  let asyncDataKeys: (() => string)[]
  const stops: (() => void)[] = []

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 30, 0, 30))
    responseCount = 20
    cursorAvailable = true
    asyncDataKeys = []
    route = reactive({
      params: { country: 'germany', state: 'sh', region: 'flensburg' },
      query: {}, fullPath: '/de/veranstaltungen/germany/sh/flensburg',
    })
    vi.stubGlobal('defineI18nRoute', vi.fn())
    vi.stubGlobal('useRoute', () => route)
    vi.stubGlobal('useLocalePath', () => (to: unknown) => to)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { siteUrl: 'https://example.test' } }))
    vi.stubGlobal('useHead', vi.fn())
    vi.stubGlobal('useSeoMeta', vi.fn())
    vi.stubGlobal('useAsyncData', async (
      key: () => string,
      load: () => Promise<unknown>,
      options: { watch?: WatchSource[] } = {},
    ) => {
      asyncDataKeys.push(key)
      const data = ref()
      stops.push(watch([key, ...(options.watch ?? [])], async () => { data.value = await load() }))
      data.value = await load()
      return { data, error: ref(null), pending: ref(false) }
    })
    api.mockImplementation(async (url: string, options?: { query: Record<string, string> }) => {
      if (url.includes('/geolist/')) return { data: { region: { name: 'Flensburg' } } }
      if (url.includes('/type-summary')) return { data: { total_event_count: 40 } }
      const reference = options!.query.start
      return { data: {
        events: Array.from({ length: responseCount }, (_, i) => ({
          uuid: `event-${i}`, date_uuid: `date-${i}`, title: `Event ${i}`,
          start_date: '2026-10-01', start_time: '09:00', date_slug: '202610010900',
        })),
        last_event_date_uuid: cursorAvailable && responseCount ? 'next-date' : null,
        last_event_start_at: cursorAvailable && responseCount ? `${reference}T23:59` : null,
        pagination_reference_date: reference,
      } }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    stops.splice(0).forEach(stop => stop())
  })

  async function render() {
    wrapper = mount(defineComponent({
      render: () => h(Suspense, null, { default: () => h(RegionPage) }),
    }), {
      global: {
        mocks: { $t: (key: string) => key, formatDate: (_locale: unknown, date: string) => date },
        stubs: { NuxtLink: { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' } },
      },
    })
    await flushPromises()
    return wrapper
  }

  it('uses the URL reference for the list, count, cache keys and navigation links', async () => {
    route.query = {
      start: '2026-10-29', page: '2',
      last_event_date_uuid: 'previous-date', last_event_start_at: '2026-10-29T23:59',
    }
    const view = await render()
    expect(api.mock.calls.find(([url]) => url === '/api/events')![1].query).toEqual({
      start: '2026-10-29', limit: 20, geolist_region: 'germany,sh,flensburg',
      last_event_date_uuid: 'previous-date', last_event_start_at: '2026-10-29T23:59',
    })
    expect(api.mock.calls.find(([url]) => url === '/api/events/type-summary')![1].query.start).toBe('2026-10-29')
    expect(asyncDataKeys[1]!()).toContain('2026-10-29')
    expect(asyncDataKeys[2]!()).toContain('2026-10-29')
    expect(JSON.parse(view.get('a[rel="next"]').attributes('data-to')).query).toEqual({
      page: 3, start: '2026-10-29', last_event_date_uuid: 'next-date', last_event_start_at: '2026-10-29T23:59',
    })
    const first = view.findAll('a').find(link => link.text() === 'First page')!
    expect(JSON.parse(first.attributes('data-to')).query).toEqual({ start: '2026-10-29' })
    const detail = view.findAll('a').find(link => link.text() === 'Details')!
    expect(JSON.parse(detail.attributes('data-to')).params.date_identifier).toBe('202610010900')
  })

  it('uses the local calendar date when no start is present', async () => {
    await render()
    for (const path of ['/api/events', '/api/events/type-summary']) {
      expect(api.mock.calls.find(([url]) => url === path)![1].query.start).toBe('2026-10-30')
    }
  })

  it('preserves the server reference date during hydration across midnight', async () => {
    vi.stubGlobal('useState', () => ref('2026-10-29'))
    const view = await render()
    expect(api.mock.calls.find(([url]) => url === '/api/events')![1].query.start).toBe('2026-10-29')
    expect(api.mock.calls.find(([url]) => url === '/api/events/type-summary')![1].query.start).toBe('2026-10-29')
    expect(JSON.parse(view.get('a[rel="next"]').attributes('data-to')).query.start).toBe('2026-10-29')
  })

  it('reloads the list and count when the URL reference changes', async () => {
    route.query = { start: '2026-10-29' }
    await render()
    api.mockClear()
    route.query.start = '2026-10-28'
    await flushPromises()
    for (const path of ['/api/events', '/api/events/type-summary']) {
      const requests = api.mock.calls.filter(([url]) => url === path)
      expect(requests).toHaveLength(1)
      expect(requests[0]![1].query.start).toBe('2026-10-28')
    }
    expect(asyncDataKeys[1]!()).toContain('2026-10-28')
  })

  it.each([0, 20])('hides Next for %i events without a cursor', async count => {
    responseCount = count
    cursorAvailable = false
    const view = await render()
    expect(view.find('a[rel="next"]').exists()).toBe(false)
  })
})
