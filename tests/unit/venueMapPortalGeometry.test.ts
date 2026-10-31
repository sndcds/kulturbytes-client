import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import type { Map as MapLibreMapType } from 'maplibre-gl'
import type { PortalBoundaryFeature } from '../../app/types/portal'
import VenueMap from '../../app/components/venue/VenueMap.client.vue'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { api } from './nuxt'

const mapLayers = vi.hoisted(() => ({
  initializeLayers: vi.fn().mockResolvedValue(undefined),
  updateSources: vi.fn(),
  addPortalBoundary: vi.fn(),
  removePortalBoundary: vi.fn(),
}))

vi.mock('maplibre-gl', () => ({ default: {} }))
vi.mock('../../app/composables/useMapLibreLayers', () => ({
  useMapLibreLayers: () => mapLayers,
}))

const initialGeometryUuid = '786507f2-e513-4060-badf-2ab0cf6388d3'
const boundary: PortalBoundaryFeature = {
  type: 'Feature',
  properties: { uuid: 'boundary', name: 'Portal', slug: 'portal', description: null },
  geometry: { type: 'Polygon', coordinates: [[[9, 54], [10, 54], [10, 55], [9, 54]]] },
}

describe('venue map portal geometry', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  const requests = (path: string) => api.mock.calls.filter(([url]) => url === path)
  const boundaryPath = '/api/portal/portal/geojson'
  const venuePath = '/api/venues/geojson'

  beforeEach(() => {
    for (const mock of Object.values(mapLayers)) mock.mockClear()
    vi.stubGlobal('usePortal', () => ({ activePortal: ref(null) }))
    api.mockImplementation(async (url: string) => ({
      data: url === venuePath ? { type: 'FeatureCollection', features: [] } : boundary,
    }))
  })

  afterEach(() => wrapper?.unmount())

  async function render() {
    wrapper = mount({
      components: { VenueMap },
      template: '<Suspense><VenueMap /></Suspense>',
    }, {
      global: { stubs: {
        MapLibreMap: { name: 'MapLibreMap', emits: ['map-loaded'], template: '<div />' },
      } },
    })
    await flushPromises()
    const map = {
      getBounds: () => ({
        getWest: () => 9, getSouth: () => 54, getEast: () => 10, getNorth: () => 55,
      }),
      getLayer: vi.fn(),
      on: vi.fn(),
    } as unknown as MapLibreMapType
    wrapper.findComponent({ name: 'MapLibreMap' }).vm.$emit('map-loaded', map)
    await flushPromises()
    return map
  }

  it('sends the selected geometry for both venue and portal boundary GeoJSON', async () => {
    useFiltersStore().eventPortalUuid = 'portal'
    const map = await render()
    expect(requests(boundaryPath)[0]?.[1].query).toEqual({ geometry: initialGeometryUuid })
    expect(requests(venuePath)[0]?.[1].query).toEqual({
      bbox: '9,54,10,55', portal: 'portal', geometry: initialGeometryUuid,
    })
    expect(mapLayers.addPortalBoundary).toHaveBeenCalledWith(map, boundary, undefined)
  })

  it('omits the geometry for default boundary and venue queries', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    filters.setEventPortalGeometryUuid(null)
    await render()
    expect(requests(boundaryPath)[0]?.[1].query).toEqual({})
    expect(requests(venuePath)[0]?.[1].query).toEqual({ bbox: '9,54,10,55', portal: 'portal' })
  })

  it('keeps portal parameters out of global venue requests', async () => {
    await render()
    expect(requests(boundaryPath)).toHaveLength(0)
    expect(requests(venuePath)[0]?.[1].query).toEqual({ bbox: '9,54,10,55' })
  })

  it('reloads both layers when geometry changes and caches boundaries by portal and geometry', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    await render()
    filters.setEventPortalGeometryUuid('other-geometry')
    await flushPromises()
    expect(requests(boundaryPath)).toHaveLength(2)
    expect(requests(boundaryPath)[1]?.[1].query).toEqual({ geometry: 'other-geometry' })
    expect(requests(venuePath)[1]?.[1].query.geometry).toBe('other-geometry')
    filters.setEventPortalGeometryUuid(null)
    await flushPromises()
    expect(requests(boundaryPath)).toHaveLength(3)
    expect(requests(boundaryPath)[2]?.[1].query).toEqual({})
    expect(requests(venuePath)[2]?.[1].query).toEqual({ bbox: '9,54,10,55', portal: 'portal' })
    filters.setEventPortalGeometryUuid(initialGeometryUuid)
    await flushPromises()
    expect(requests(boundaryPath)).toHaveLength(3)
    expect(requests(venuePath)).toHaveLength(4)
    expect(mapLayers.addPortalBoundary).toHaveBeenCalledTimes(4)
  })

  it('ignores boundary and venue responses from the previously selected geometry', async () => {
    const filters = useFiltersStore()
    filters.eventPortalUuid = 'portal'
    let resolveBoundary!: (value: { data: PortalBoundaryFeature }) => void
    let resolveVenues!: (value: unknown) => void
    api.mockImplementationOnce(() => new Promise(resolve => { resolveBoundary = resolve }))
    api.mockImplementationOnce(() => new Promise(resolve => { resolveVenues = resolve }))
    await render()
    const signal = requests(boundaryPath)[0]?.[1].signal as AbortSignal
    filters.setEventPortalGeometryUuid('other-geometry')
    await flushPromises()
    expect(signal.aborted).toBe(true)
    expect(mapLayers.addPortalBoundary).toHaveBeenCalledTimes(1)
    expect(mapLayers.updateSources).toHaveBeenCalledTimes(1)
    resolveBoundary({ data: boundary })
    resolveVenues({ data: { type: 'FeatureCollection', features: [] } })
    await flushPromises()
    expect(mapLayers.addPortalBoundary).toHaveBeenCalledTimes(1)
    expect(mapLayers.updateSources).toHaveBeenCalledTimes(1)
  })
})
