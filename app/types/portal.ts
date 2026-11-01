import type { Feature, MultiPolygon, Polygon } from 'geojson'

export interface Portal {
    uuid: string
    slug: string
    org_uuid: string
    name: string
    description: string
    main_image_url?: string | null
    web_logo_url?: string | null
    footer_logo_url?: string | null
    config?: {
        style?: {
            logo?: {
                top_margin?: string | null
                bottom_margin?: string | null
            } | null
            nav_height?: string | null
        } | null
    } | null
}

export interface PortalBoundaryProperties {
    description: string | null
    name: string
    slug: string
    uuid: string
}

export interface PortalGeometry {
    uuid: string
    name: string
    description: string
    order: number
    admin_level: number | null
    type: string | null
    geometry: Polygon | MultiPolygon | null
    child_types: { type: string, count: number }[]
    childs: PortalGeometry[]
}

export interface PortalGeometries {
    geometry: PortalGeometry | null
}

export type PortalBoundaryFeature = Feature<
    Polygon | MultiPolygon,
    {
        description: string | null
        name: string
        slug: string
        uuid: string
    }
>
