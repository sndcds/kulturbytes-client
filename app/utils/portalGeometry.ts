import type { MultiPolygon, Polygon } from 'geojson'
import type { PortalGeometry } from '~/types/portal'

export function groupPortalChildren(geometry: PortalGeometry | null) {
    const groups = new Map<string, PortalGeometry[]>()

    for (const child of geometry?.childs ?? []) {
        if (child.type === null) continue
        const children = groups.get(child.type) ?? []
        children.push(child)
        groups.set(child.type, children)
    }

    return Array.from(groups, ([type, children]) => ({ type, children }))
}

export function portalGeometryBounds(
    geometry: Polygon | MultiPolygon | null
): [[number, number], [number, number]] | null {
    if (!geometry) return null

    const polygons = geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.coordinates
    let west = Infinity
    let south = Infinity
    let east = -Infinity
    let north = -Infinity

    for (const polygon of polygons) {
        for (const ring of polygon) {
            for (const [lng, lat] of ring) {
                if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
                west = Math.min(west, lng!)
                south = Math.min(south, lat!)
                east = Math.max(east, lng!)
                north = Math.max(north, lat!)
            }
        }
    }

    return Number.isFinite(west) ? [[west, south], [east, north]] : null
}
