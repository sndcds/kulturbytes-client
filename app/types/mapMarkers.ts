import type { Component } from 'vue'
import type { Feature, Point } from 'geojson'

export interface VenueProperties {
    uuid:string
    name:string
    city?:string|null
    country?:string|null
    logo_uuid?:string|null
    marker_style?:string|null
    type?:string|null
}

export type VenueFeature = Feature<Point, VenueProperties>
export type MarkerComponent = Component