import { describe, it, expect } from 'vitest'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventQueryParams } from '../../app/composables/useEventQueryParams'

const initialGeometryUuid = '786507f2-e513-4060-badf-2ab0cf6388d3'

describe('portal geometry filters', () => {
  it('stores the initial geometry in filter state and preserves portal scope on reset', () => {
    const filters = useFiltersStore()
    expect(filters.$state.eventPortalGeometryUuid).toBe(initialGeometryUuid)
    filters.eventPortalUuid = 'portal'
    filters.setEventPortalGeometryUuid('other-geometry')
    filters.eventSearch = 'music'
    filters.resetFilters()
    expect(filters.eventPortalUuid).toBe('portal')
    expect(filters.eventPortalGeometryUuid).toBe('other-geometry')
    expect(filters.eventSearch).toBe('')
    filters.setEventPortalGeometryUuid(null)
    filters.resetFilters()
    expect(filters.$state.eventPortalGeometryUuid).toBeNull()
  })

  it('keeps the initial value when restoring older state and preserves a saved null', () => {
    const filters = useFiltersStore()
    filters.$patch({ eventPortalUuid: 'portal' })
    expect(filters.eventPortalGeometryUuid).toBe(initialGeometryUuid)
    filters.$patch({ eventPortalGeometryUuid: null })
    expect(filters.eventPortalGeometryUuid).toBeNull()
  })

  it('sends the selected geometry with portal-scoped event and summary queries', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    const { build, filterKey } = useEventQueryParams()
    const params = await build({ includePagination: true })
    expect(params.get('portal')).toBe('portal')
    expect(params.get('geometry')).toBe(initialGeometryUuid)
    const previousKey = filterKey.value
    filters.setEventPortalGeometryUuid('other-geometry')
    expect(filterKey.value).not.toBe(previousKey)
    expect((await build()).get('geometry')).toBe('other-geometry')
  })

  it('omits the geometry parameter for the default geometry and keeps the portal', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    filters.setEventPortalGeometryUuid(null)
    const params = await useEventQueryParams().build()
    expect(params.get('portal')).toBe('portal')
    expect(params.has('geometry')).toBe(false)
  })

  it('omits portal parameters when no portal is active or filters are disabled', async () => {
    const filters = useFiltersStore()
    const { build } = useEventQueryParams()
    const global = await build()
    expect(global.has('portal')).toBe(false)
    expect(global.has('geometry')).toBe(false)
    filters.eventPortalUuid = 'portal'
    const unfiltered = await build({ includeFilters: false })
    expect(unfiltered.has('portal')).toBe(false)
    expect(unfiltered.has('geometry')).toBe(false)
  })

  it('keeps the geometry from the applied snapshot until the next query', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    const { build, getSnapshot } = useEventQueryParams()
    const applied = getSnapshot()
    filters.setEventPortalGeometryUuid(null)
    expect((await build({ filterSnapshot: applied })).get('geometry')).toBe(initialGeometryUuid)
    expect((await build()).has('geometry')).toBe(false)
  })
})
