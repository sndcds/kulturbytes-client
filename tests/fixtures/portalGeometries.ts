import type { PortalGeometry } from '../../app/types/portal'

export function portalGeometry(overrides: Partial<PortalGeometry> = {}): PortalGeometry {
  return {
    uuid: 'main-area', name: 'Gesamtes Stadtgebiet', description: '', order: 0,
    admin_level: 8, type: 'city',
    geometry: {
      type: 'Polygon',
      coordinates: [[[9, 54], [10, 54], [10, 55], [9, 55], [9, 54]]],
    },
    child_types: [], childs: [], ...overrides,
  }
}

export function portalHierarchy(): PortalGeometry {
  return portalGeometry({
    child_types: [{ type: 'city-district', count: 2 }, { type: 'village', count: 1 }],
    childs: [
      portalGeometry({
        uuid: 'district-west', name: 'West', type: 'city-district',
        geometry: {
          type: 'Polygon',
          coordinates: [[[9, 54], [9.5, 54], [9.5, 55], [9, 55], [9, 54]]],
        },
        child_types: [{ type: 'quarter', count: 1 }],
        childs: [portalGeometry({ uuid: 'quarter', type: 'quarter' })],
      }),
      portalGeometry({
        uuid: 'district-east', name: 'Ost', type: 'city-district',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[[[9.5, 54], [10, 54], [10, 55], [9.5, 55], [9.5, 54]]]],
        },
      }),
      portalGeometry({ uuid: 'village', name: 'Dorf', type: 'village' }),
      portalGeometry({ uuid: 'untyped', type: null }),
    ],
  })
}
