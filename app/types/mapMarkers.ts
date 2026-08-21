import type { Component } from 'vue'
import type {
    Feature,
    MultiPolygon,
    Point,
    Polygon,
} from 'geojson'

export interface VenueProperties {
    uuid:string
    name:string
    city?:string|null
    country?:string|null
    house_number?:string|null
    street?:string|null
    web_link?:string|null
    logo_url?:string|null
    logo_uuid?:string|null
    marker_style?:string|null
    type?:string|null
}

export type VenueFeature = Feature<Point, VenueProperties>
export type VenueBuildingFeature = Feature<
    Polygon | MultiPolygon,
    VenueProperties
>

export interface VenueApiFeature {
    type: 'Feature'
    point: Point
    building?: Polygon | MultiPolygon
    properties: VenueProperties
}

export interface VenueApiFeatureCollection {
    type: 'FeatureCollection'
    features: VenueApiFeature[]
}

export type MarkerComponent = Component
