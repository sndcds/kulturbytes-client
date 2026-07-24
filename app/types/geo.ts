export interface GeoListCountry {
    code: string
    name: string
    slug: string
}

interface GeoListState {
    country_code: string
    code: string
    name: string
    slug: string
}

export interface GeoListCountriesResponse {
    meta_date: any
    data: GeoListCountry[]
}

interface GeoListGeoStatesResponse {
    meta_data: any
    data: GeoListState[]
}