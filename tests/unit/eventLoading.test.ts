import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import EventsView from '../../app/components/event/EventsView.vue'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventFilterEditingStore } from '../../app/stores/eventFilterEditingStore'
import { api } from './nuxt'

const page = (count = 0, title = 'event') => ({ data: {
  events: Array.from({ length: count }, (_, i) => ({ uuid: `${title}-${i}`, title })),
  last_event_date_uuid: 'cursor', last_event_start_at: '2026-10-10',
} })

describe('event request lifecycle', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  let observerCallback: IntersectionObserverCallback
  let disconnect: ReturnType<typeof vi.fn>
  const observe = () => observerCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)

  beforeEach(() => {
    vi.useFakeTimers()
    disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { observerCallback = callback }
      observe = vi.fn()
      disconnect = disconnect
    })
    api.mockResolvedValue(page())
  })
  afterEach(() => wrapper?.unmount())

  async function render() {
    wrapper = mount(EventsView, { global: { stubs: { EventCard: { props: ['event'], template: '<p>{{ event.title }}</p>' } } } })
    await flushPromises()
    return wrapper
  }

  it('opening, editing every filter and resetting cannot request events', async () => {
    api.mockResolvedValue(page(20))
    await render()
    const filters = useFiltersStore()
    const editing = useEventFilterEditingStore()
    expect(api).toHaveBeenCalledTimes(1)
    editing.beginMobileFilterEditing()
    filters.eventCategories = [1]
    filters.eventSearch = 'music'
    filters.eventDateSpan = 'today'
    filters.eventCity = 'Flensburg'
    filters.eventTypeIds = [2]
    filters.eventGenreIds = [3]
    filters.eventAgeFrom = 5
    filters.eventPriceType = 'free'
    await nextTick()
    observe()
    await vi.advanceTimersByTimeAsync(1000)
    filters.resetFilters()
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalled()
  })

  it.each(['close', 'show'])('%s applies the last keystroke once and resumes infinite scroll', async () => {
    api.mockResolvedValue(page(20))
    await render()
    const editing = useEventFilterEditingStore()
    editing.beginMobileFilterEditing()
    await nextTick()
    useFiltersStore().eventSearch = 'last keystroke'
    editing.finishMobileFilterEditing()
    editing.finishMobileFilterEditing()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api).toHaveBeenCalledTimes(2)
    expect(api.mock.calls[1]?.[0]).toContain('search=last+keystroke')
    observe()
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(3)
    expect(api.mock.calls[2]?.[0]).toContain('last_event_date_uuid=cursor')
  })

  it('a view mounted during editing waits until the session finishes', async () => {
    useEventFilterEditingStore().beginMobileFilterEditing()
    await render()
    expect(api).not.toHaveBeenCalled()
    useEventFilterEditingStore().finishMobileFilterEditing()
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(1)
  })

  it('restores document scroll after the applied first page renders', async () => {
    await render()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const editing = useEventFilterEditingStore()
    editing.beginMobileFilterEditing()
    editing.setScrollPosition({ x: 0, y: 250 })
    await nextTick()
    editing.finishMobileFilterEditing()
    await flushPromises()
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith(0, 250)
    expect(editing.scrollPosition).toBeNull()
    scrollTo.mockRestore()
  })

  it('shows the result list after the applied cards render without restoring old scroll', async () => {
    const view = await render()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const showResults = vi.fn(() => expect(view.text()).toContain('applied-result'))
    Object.defineProperty(view.element, 'scrollIntoView', { configurable: true, value: showResults })
    const editing = useEventFilterEditingStore()
    editing.beginMobileFilterEditing()
    editing.setScrollPosition({ x: 0, y: 250 })
    await nextTick()
    api.mockResolvedValue(page(1, 'applied-result'))
    editing.showResultsOnApply()
    editing.finishMobileFilterEditing()
    await flushPromises()
    expect(showResults).toHaveBeenCalledExactlyOnceWith({ block: 'start' })
    expect(scrollTo).not.toHaveBeenCalled()
    expect(editing.showResultsAfterLoading).toBe(false)
    scrollTo.mockRestore()
  })

  it('discards a response arriving after opening mobile filters', async () => {
    let resolveOld!: (value: ReturnType<typeof page>) => void
    api.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    await render()
    const signal = api.mock.calls[0]?.[1].signal as AbortSignal
    const editing = useEventFilterEditingStore()
    editing.beginMobileFilterEditing()
    expect(signal.aborted).toBe(true)
    await nextTick()
    useFiltersStore().eventSearch = 'new'
    api.mockResolvedValue(page(1, 'new-result'))
    editing.finishMobileFilterEditing()
    await flushPromises()
    resolveOld(page(1, 'obsolete-result'))
    await flushPromises()
    expect(wrapper?.text()).toContain('new-result')
    expect(wrapper?.text()).not.toContain('obsolete-result')
    expect(api).toHaveBeenCalledTimes(2)
  })

  it('cancels a desktop debounce when mobile editing begins', async () => {
    await render()
    useFiltersStore().eventSearch = 'pending'
    await nextTick()
    useEventFilterEditingStore().beginMobileFilterEditing()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api).toHaveBeenCalledTimes(1)
  })

  it('desktop discrete filters and reset load immediately, text remains debounced', async () => {
    await render()
    const filters = useFiltersStore()
    filters.eventCategories = [1]
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(2)
    filters.eventSearch = 'music'
    await nextTick()
    expect(api).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(500)
    expect(api).toHaveBeenCalledTimes(3)
    filters.resetFilters()
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api).toHaveBeenCalledTimes(4)
  })
})
