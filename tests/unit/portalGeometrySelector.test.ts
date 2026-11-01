import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Map as MapLibreMapType } from 'maplibre-gl'
import PortalGeometrySelector from '../../app/components/portal/PortalGeometrySelector.vue'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { groupPortalChildren, portalGeometryBounds } from '../../app/utils/portalGeometry'
import { portalGeometry, portalHierarchy } from '../fixtures/portalGeometries'

describe('portal geometry data', () => {
  it('groups direct children by type, preserving their order and excluding untyped children and grandchildren', () => {
    expect(groupPortalChildren(portalHierarchy()).map(group => ({
      type: group.type, uuids: group.children.map(child => child.uuid),
    }))).toEqual([
      { type: 'city-district', uuids: ['district-west', 'district-east'] },
      { type: 'village', uuids: ['village'] },
    ])
    expect(groupPortalChildren(null)).toEqual([])
    expect(groupPortalChildren(portalGeometry())).toEqual([])
  })

  it('calculates bounds across all polygons and handles absent and empty coordinates', () => {
    expect(portalGeometryBounds(portalHierarchy().geometry)).toEqual([[9, 54], [10, 55]])
    expect(portalGeometryBounds({ type: 'MultiPolygon', coordinates: [
      [[[9, 54], [10, 54], [10, 55], [9, 54]]],
      [[[-2, 50], [0, 50], [0, 52], [-2, 50]]],
    ] })).toEqual([[-2, 50], [10, 55]])
    expect(portalGeometryBounds(null)).toBeNull()
    expect(portalGeometryBounds({ type: 'Polygon', coordinates: [] })).toBeNull()
  })
})

function createMap() {
  const handlers = new Map<string, (event?: unknown) => void>()
  const canvas = document.createElement('canvas')
  const sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>()
  return {
    handlers,
    addSource: vi.fn((id: string, _source: unknown) => sources.set(id, { setData: vi.fn() })),
    getSource: vi.fn((id: string) => sources.get(id)),
    addLayer: vi.fn(), setFilter: vi.fn(), fitBounds: vi.fn(), resize: vi.fn(),
    getCanvas: () => canvas,
    getContainer: () => document.createElement('div'),
    on: vi.fn((event: string, layer: string, handler: (event?: unknown) => void) => {
      handlers.set(`${event}:${layer}`, handler)
    }),
  }
}

describe('portal geometry selection', () => {
  let wrapper: ReturnType<typeof mount> | undefined
  const disconnect = vi.fn()

  beforeEach(() => {
    disconnect.mockClear()
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn()
      disconnect = disconnect
    })
  })
  afterEach(() => wrapper?.unmount())

  function render(geometry = portalHierarchy()) {
    wrapper = mount(PortalGeometrySelector, {
      props: { geometry },
      global: { stubs: {
        MapLibreMap: { name: 'MapLibreMap', emits: ['map-loaded'], template: '<div class="mock-map" />' },
      } },
    })
    const maps = wrapper.findAllComponents({ name: 'MapLibreMap' }).map(component => {
      const map = createMap()
      component.vm.$emit('map-loaded', map as unknown as MapLibreMapType)
      return map
    })
    return maps
  }

  it('renders one map per direct child type, with its own children, fitted to the main geometry', () => {
    const maps = render()
    expect(wrapper!.findAll('h2').map(heading => heading.text())).toEqual(['city-district', 'village'])
    expect(maps).toHaveLength(2)
    for (const map of maps) {
      expect(map.fitBounds).toHaveBeenCalledWith([[9, 54], [10, 55]], { padding: 24, duration: 0, maxZoom: 14 })
    }
    expect(maps.map(map => map.addSource.mock.calls.find(([id]) => id === 'portal-children'))).toMatchObject([
      ['portal-children', { data: { features: [
        { properties: { uuid: 'district-west' }, geometry: { type: 'Polygon' } },
        { properties: { uuid: 'district-east' }, geometry: { type: 'MultiPolygon' } },
      ] } }],
      ['portal-children', { data: { features: [{ properties: { uuid: 'village' } }] } }],
    ])
  })

  it('selects polygons on click, updates the shared filter and highlight, and resets using the button', async () => {
    const maps = render()
    const filters = useFiltersStore()
    maps[0]!.handlers.get('click:portal-children-fill')!({ features: [{ properties: { uuid: 'district-west' } }] })
    await flushPromises()
    expect(filters.eventPortalGeometryUuid).toBe('district-west')
    expect(wrapper!.find('select').element.value).toBe('district-west')
    expect(maps[0]!.setFilter).toHaveBeenLastCalledWith('portal-selection-outline', ['==', ['get', 'uuid'], 'district-west'])

    maps[1]!.handlers.get('click:portal-children-fill')!({ features: [{ properties: { uuid: 'village' } }] })
    await flushPromises()
    expect(filters.eventPortalGeometryUuid).toBe('village')
    expect(maps[0]!.setFilter).toHaveBeenLastCalledWith('portal-selection-outline', ['==', ['get', 'uuid'], ''])
    expect(maps[1]!.setFilter).toHaveBeenLastCalledWith('portal-selection-outline', ['==', ['get', 'uuid'], 'village'])

    await wrapper!.findAll('button')[1]!.trigger('click')
    expect(filters.eventPortalGeometryUuid).toBeNull()
    expect(maps[1]!.fitBounds).toHaveBeenCalledTimes(2)
    expect(maps[1]!.setFilter).toHaveBeenLastCalledWith('portal-selection-outline', ['==', ['get', 'uuid'], ''])
  })

  it('supports selection by keyboard using the select and a pointer cursor over child polygons', async () => {
    const [map] = render()
    await wrapper!.find('select').setValue('district-east')
    expect(useFiltersStore().eventPortalGeometryUuid).toBe('district-east')
    map!.handlers.get('mouseenter:portal-children-fill')!()
    expect(map!.getCanvas().style.cursor).toBe('pointer')
    map!.handlers.get('mouseleave:portal-children-fill')!()
    expect(map!.getCanvas().style.cursor).toBe('')
    await wrapper!.find('select').setValue('')
    expect(useFiltersStore().eventPortalGeometryUuid).toBeNull()
    expect(map!.fitBounds).toHaveBeenCalledTimes(2)
    map!.handlers.get('click:portal-children-fill')!({ features: [{ properties: { uuid: 'unrelated' } }] })
    expect(useFiltersStore().eventPortalGeometryUuid).toBeNull()
  })

  it('restores a valid saved selection and clears it when loading another hierarchy', async () => {
    useFiltersStore().setEventPortalGeometryUuid('district-east')
    const maps = render()
    expect(maps[0]!.setFilter).toHaveBeenLastCalledWith('portal-selection-outline', ['==', ['get', 'uuid'], 'district-east'])
    await wrapper!.setProps({ geometry: portalGeometry({ uuid: 'other-main' }) })
    expect(useFiltersStore().eventPortalGeometryUuid).toBeNull()
    expect(wrapper!.findAll('.mock-map')).toHaveLength(0)
    expect(disconnect).toHaveBeenCalledTimes(2)
    await wrapper!.setProps({ geometry: null })
    useFiltersStore().setEventPortalGeometryUuid('previous-portal-area')
    await flushPromises()
    expect(useFiltersStore().eventPortalGeometryUuid).toBeNull()
    expect(wrapper!.findAll('.mock-map')).toHaveLength(0)
  })
})
