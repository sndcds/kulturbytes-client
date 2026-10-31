import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import ActiveEventFilters from '../../app/components/filters/ActiveEventFilters.vue'
import EventsView from '../../app/components/event/EventsView.vue'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventFilterEditingStore } from '../../app/stores/eventFilterEditingStore'
import { useEventTypeStore } from '../../app/stores/eventTypesStore'
import { useEventQueryParams } from '../../app/composables/useEventQueryParams'
import de from '../../i18n/locales/de.json'
import en from '../../i18n/locales/en.json'
import da from '../../i18n/locales/da.json'
import { api } from './nuxt'

describe('active event filters', () => {
  let wrapper: VueWrapper | undefined
  const locale = ref<'de' | 'en' | 'da'>('de')
  const messages = { de, en, da }
  const remove = (label: string) => wrapper!.get(`button[aria-label="Filter entfernen: ${label}"]`).trigger('click')
  const chipLabels = () => wrapper!.findAll('.active-event-filter-chip').map(chip => chip.text())

  beforeEach(() => {
    locale.value = 'de'
    vi.stubGlobal('useI18n', () => ({
      locale,
      t: (key: string, params: Record<string, string | number> = {}) => {
        const value = key.split('.').reduce((value, key) => value?.[key], messages[locale.value] as any)
        return (value ?? key).replace(/\{(\w+)\}/g, (_: string, key: string) => String(params[key]))
      },
    }))
    const types = useEventTypeStore()
    types.loaded = true
    types.types = {
      de: [{ id: 1, name: 'Konzert', genres: [{ id: 10, name: 'Jazz' }, { id: 11, name: 'Rock' }] }],
      en: [{ id: 1, name: 'Concert', genres: [{ id: 10, name: 'Jazz' }, { id: 11, name: 'Rock' }] }],
      da: [{ id: 1, name: 'Koncert', genres: [{ id: 10, name: 'Jazz' }, { id: 11, name: 'Rock' }] }],
    }
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
    api.mockResolvedValue({ data: { events: [], last_event_date_uuid: '', last_event_start_at: '' } })
  })

  afterEach(() => wrapper?.unmount())

  it('hides the bar for unfiltered events and inactive dependent values', () => {
    const filters = useFiltersStore()
    filters.eventDateSpan = 'all'
    filters.eventDateStart = '2026-10-23'
    filters.eventGenreIds = [10]
    wrapper = mount(ActiveEventFilters)
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('shows every selected option with readable values, including dates, radius and currency', () => {
    useFiltersStore().$patch({
      eventCategories: [1, 2], eventSearch: 'Kulturabend',
      eventDateSpan: 'range', eventDateStart: '2026-10-23', eventDateEnd: '2026-10-25',
      eventCity: 'Flensburg', eventPostalCode: '24937', eventVenue: 'Kühlhaus',
      eventLocationFlag: true, eventLocationRadius: 5,
      eventTypeIds: [1], eventGenreIds: [10, 11],
      eventAgeFrom: 0, eventAgeTo: 18,
      eventPriceType: 'max_price', eventMaxPrice: 12.5, eventPriceCurrency: 'DKK',
    })
    wrapper = mount(ActiveEventFilters)
    expect(chipLabels()).toEqual([
      'Kultur', 'Bildung', 'Suche: Kulturabend', 'Von 23. Okt. 2026 – Bis 25. Okt. 2026',
      'Ort/Stadt: Flensburg', 'Postleitzahl/Postcode: 24937', 'Veranstaltungsort (Name): Kühlhaus',
      'Umkreis: 5 km um deinen Standort', 'Konzert', 'Jazz', 'Rock',
      'ab 0 Jahren', 'bis 18 Jahre', 'Höchstpreis: 12,5 DKK',
    ])
    expect(wrapper.get('section').attributes('aria-label')).toBe('Aktive Filter')
    expect(wrapper.findAll('.active-event-filter-chip svg')).toHaveLength(14)
    expect(wrapper.get('.active-event-filters-reset').text()).toBe('Alles zurücksetzen')
  })

  it.each([
    ['today', '', '', 'Heute'],
    ['tomorrow', '', '', 'Morgen'],
    ['weekend', '', '', 'Wochenende'],
    ['next_week', '', '', 'Kommende Woche'],
    ['weekend_after', '', '', 'Wochenende danach'],
    ['range', '2026-10-23', '', 'Von 23. Okt. 2026'],
    ['range', '', '2026-10-25', 'Bis 25. Okt. 2026'],
  ] as const)('removes the entire %s date filter', async (span, start, end, label) => {
    const filters = useFiltersStore()
    filters.$patch({ eventDateSpan: span, eventDateStart: start, eventDateEnd: end, eventSearch: 'music' })
    wrapper = mount(ActiveEventFilters)
    await remove(label)
    expect(filters.eventDateSpan).toBeNull()
    expect(filters.eventDateStart).toBe('')
    expect(filters.eventDateEnd).toBe('')
    expect(chipLabels()).toEqual(['Suche: music'])
  })

  it.each([
    ['eventSearch', 'music', '', 'Suche: music'],
    ['eventCity', 'Flensburg', '', 'Ort/Stadt: Flensburg'],
    ['eventPostalCode', '24937', '', 'Postleitzahl/Postcode: 24937'],
    ['eventVenue', 'Kühlhaus', '', 'Veranstaltungsort (Name): Kühlhaus'],
    ['eventAgeFrom', 0, null, 'ab 0 Jahren'],
    ['eventAgeTo', 18, null, 'bis 18 Jahre'],
  ] as const)('clears %s while preserving other filters', async (field, value, empty, label) => {
    const filters = useFiltersStore()
    filters.$patch({ [field]: value, eventCategories: [1] })
    wrapper = mount(ActiveEventFilters)
    await remove(label)
    expect(filters[field]).toBe(empty)
    expect(filters.eventCategories).toEqual([1])
    expect(chipLabels()).toEqual(['Kultur'])
  })

  it('removes categories and genres individually, and clears dependent genres when removing their type', async () => {
    const filters = useFiltersStore()
    filters.$patch({ eventCategories: [1, 2], eventTypeIds: [1], eventGenreIds: [10, 11] })
    wrapper = mount(ActiveEventFilters)
    await remove('Kultur')
    expect(filters.eventCategories).toEqual([2])
    await remove('Jazz')
    expect(filters.eventTypeIds).toEqual([1])
    expect(filters.eventGenreIds).toEqual([11])
    expect((await useEventQueryParams().build()).get('genres')).toBe('11')
    await remove('Rock')
    const params = await useEventQueryParams().build()
    expect(params.has('genres')).toBe(false)
    expect(params.get('event_types')).toBe('1')
    filters.eventGenreIds = [10]
    await remove('Konzert')
    expect(filters.eventTypeIds).toEqual([])
    expect(filters.eventGenreIds).toEqual([])
    await remove('Bildung')
    expect(filters.eventCategories).toBeNull()
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it.each(['free', 'donation', 'max_price'])('removes the %s price filter and dependent values', async price => {
    const filters = useFiltersStore()
    filters.$patch({ eventPriceType: price, eventMaxPrice: 25, eventPriceCurrency: 'DKK' })
    wrapper = mount(ActiveEventFilters)
    await wrapper.get('.active-event-filter-chip').trigger('click')
    expect(filters.eventPriceType).toBeNull()
    expect(filters.eventMaxPrice).toBe(10)
    expect(filters.eventPriceCurrency).toBe('EUR')
    expect((await useEventQueryParams().build()).has('price')).toBe(false)
  })

  it('removes current location and radius together', async () => {
    const filters = useFiltersStore()
    filters.$patch({ eventLocationFlag: true, eventLocationRadius: 25, eventCity: 'Flensburg' })
    wrapper = mount(ActiveEventFilters)
    await remove('Umkreis: 25 km um deinen Standort')
    expect(filters.eventLocationFlag).toBe(false)
    expect(filters.eventLocationRadius).toBe(3)
    expect(filters.eventCity).toBe('Flensburg')
  })

  it('keeps applied chips during mobile editing and updates them when the draft is applied', async () => {
    const filters = useFiltersStore()
    const editing = useEventFilterEditingStore()
    filters.$patch({ eventSearch: 'old', eventDateSpan: 'today' })
    wrapper = mount(ActiveEventFilters)
    editing.beginMobileFilterEditing()
    filters.$patch({ eventSearch: 'new', eventDateSpan: 'tomorrow' })
    await nextTick()
    expect(chipLabels()).toEqual(['Suche: old', 'Heute'])
    editing.finishMobileFilterEditing()
    await nextTick()
    expect(chipLabels()).toEqual(['Suche: new', 'Morgen'])
  })

  it('updates translated labels when switching languages', async () => {
    useFiltersStore().$patch({ eventCategories: [1], eventTypeIds: [1], eventSearch: 'Jazz' })
    wrapper = mount(ActiveEventFilters)
    locale.value = 'en'
    await nextTick()
    expect(chipLabels()).toEqual(['Culture', 'Search: Jazz', 'Concert'])
    expect(wrapper.get('section').attributes('aria-label')).toBe('Active filters')
    locale.value = 'da'
    await nextTick()
    expect(chipLabels()).toEqual(['Kultur', 'Find: Jazz', 'Koncert'])
    expect(wrapper.get('section').attributes('aria-label')).toBe('Aktive filtre')
  })

  it('sends age and price values of zero as active filters', async () => {
    const filters = useFiltersStore()
    filters.$patch({ eventAgeFrom: 0, eventAgeTo: 18, eventPriceType: 'max_price', eventMaxPrice: 0 })
    expect((await useEventQueryParams().build()).get('age')).toBe('0,18')
    expect((await useEventQueryParams().build()).get('price')).toBe('0,EUR')
    filters.eventAgeTo = null
    expect((await useEventQueryParams().build()).get('age')).toBe('0')
  })

  it('ignores empty numeric inputs produced by v-model.number', async () => {
    const filters = useFiltersStore()
    filters.$patch({
      eventAgeFrom: '' as unknown as null,
      eventAgeTo: '' as unknown as null,
      eventPriceType: 'max_price', eventMaxPrice: '' as unknown as null,
    })
    wrapper = mount(ActiveEventFilters)
    expect(chipLabels()).toEqual(['Höchstpreis'])
    const params = await useEventQueryParams().build()
    expect(params.has('age')).toBe(false)
    expect(params.has('price')).toBe(false)
  })

  it('reloads events once after chip removal and once after resetting all filters, preserving portal context', async () => {
    vi.useFakeTimers()
    const filters = useFiltersStore()
    filters.$patch({ eventSearch: 'music', eventCategories: [1], eventCity: 'Flensburg', eventPortalUuid: 'portal' })
    wrapper = mount(EventsView)
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(1)
    await remove('Kultur')
    await flushPromises()
    expect(api).toHaveBeenCalledTimes(2)
    let params = new URL(api.mock.calls[1]![0], 'https://example.test').searchParams
    expect(params.has('categories')).toBe(false)
    expect(params.get('search')).toBe('music')
    expect(params.get('city')).toBe('Flensburg*')
    await wrapper.get('.active-event-filters-reset').trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(api).toHaveBeenCalledTimes(3)
    params = new URL(api.mock.calls[2]![0], 'https://example.test').searchParams
    expect([...params.keys()].sort()).toEqual(['geometry', 'limit', 'portal', 'start'])
    expect(params.getAll('start')).toHaveLength(1)
    expect(filters.eventPortalUuid).toBe('portal')
    expect(wrapper.find('.active-event-filters').exists()).toBe(false)
  })

  it('hides global filter chips for event lists that do not use filters', async () => {
    useFiltersStore().eventSearch = 'music'
    wrapper = mount(EventsView, { props: { useFilters: false, venueUuid: 'venue' } })
    await flushPromises()
    expect(wrapper.findComponent(ActiveEventFilters).exists()).toBe(false)
    const params = new URL(api.mock.calls[0]![0], 'https://example.test').searchParams
    expect(params.get('venue_uuids')).toBe('venue')
    expect(params.has('search')).toBe(false)
  })
})
