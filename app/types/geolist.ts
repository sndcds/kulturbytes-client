import type { MultiPolygon } from 'geojson'

export interface GeoListCountry {
    code: string
    name: string
    slug: string
}

export interface GeoListState {
    country_code: string
    code: string
    name: string
    slug: string
}

export interface GeoListRegion {
    country_code: string
    state_code: string
    code: string
    name: string
    slug: string
    geometry: MultiPolygon
}

export interface GeoListCountriesResponse {
    metadate: any
    data: GeoListCountry[]
}

export interface GeoListStatesResponse {
    metadata: any
    data: GeoListState[]
}

export interface GeoListRegionsResponse {
    metadata: any
    data: GeoListRegion[]
}

export interface GeoListRegionResponse {
    metadata: any
    data: {
        country: GeoListCountry
        state: GeoListState
        region: GeoListRegion
    }
}
