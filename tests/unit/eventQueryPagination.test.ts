import { describe, it, expect } from 'vitest'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventQueryParams } from '../../app/composables/useEventQueryParams'

describe('event pagination query parameters', () => {
  it('uses the selected date once instead of the default reference date', async () => {
    useFiltersStore().$patch({ eventDateSpan: 'range', eventDateStart: '2026-11-02', eventDateEnd: '2026-11-03' })
    const params = await useEventQueryParams().build({ includePagination: true, referenceDate: '2026-10-30' })
    expect(params.getAll('start')).toEqual(['2026-11-02'])
    expect(params.get('end')).toBe('2026-11-03')
  })

  it('pins following pages to the cursor reference date and leaves its timestamp unchanged', async () => {
    useFiltersStore().$patch({ eventDateSpan: 'range', eventDateStart: '2026-11-03' })
    const params = await useEventQueryParams().build({
      includePagination: true, referenceDate: '2026-11-04',
      cursor: { date_uuid: 'last-date', start_at: '2026-11-02T23:59', reference_date: '2026-11-02' },
    })
    expect(params.getAll('start')).toEqual(['2026-11-02'])
    expect(params.get('last_event_start_at')).toBe('2026-11-02T23:59')
    expect(params.get('last_event_date_uuid')).toBe('last-date')
  })

  it('uses an explicitly applied snapshot while the draft date is different', async () => {
    const filters = useFiltersStore()
    filters.$patch({ eventDateSpan: 'range', eventDateStart: '2026-11-02' })
    const { build, getSnapshot } = useEventQueryParams()
    const applied = getSnapshot()
    filters.eventDateStart = '2026-11-03'
    const params = await build({ includePagination: true, referenceDate: '2026-10-30', filterSnapshot: applied })
    expect(params.getAll('start')).toEqual(['2026-11-02'])
  })

  it('keeps global dates out of unfiltered venue lists', async () => {
    useFiltersStore().$patch({ eventDateSpan: 'range', eventDateStart: '2026-11-02', eventDateEnd: '2026-11-03' })
    const params = await useEventQueryParams().build({
      includePagination: true, includeFilters: false, venueUuids: 'venue', referenceDate: '2026-10-30',
    })
    expect(params.getAll('start')).toEqual(['2026-10-30'])
    expect(params.get('venue_uuids')).toBe('venue')
    expect(params.has('end')).toBe(false)
  })

  it('keeps date filters on summary requests without adding pagination', async () => {
    useFiltersStore().$patch({ eventDateSpan: 'range', eventDateStart: '2026-11-02', eventDateEnd: '2026-11-03' })
    const params = await useEventQueryParams().build()
    expect(params.getAll('start')).toEqual(['2026-11-02'])
    expect(params.get('end')).toBe('2026-11-03')
    expect(params.has('limit')).toBe(false)
    expect(params.has('last_event_date_uuid')).toBe(false)
  })

  it('uses a fallback only when supplied and no date filter is selected', async () => {
    const { build } = useEventQueryParams()
    expect((await build({ includePagination: true, referenceDate: '2026-10-30' })).getAll('start')).toEqual(['2026-10-30'])
    expect((await build({ includePagination: true })).has('start')).toBe(false)
    expect((await build()).has('start')).toBe(false)
  })
})
