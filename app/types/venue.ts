import type { ApiResponse } from '~/types/api'
import type { Image } from './image'
import type { LogoImage, LogoGroup } from './logo'


export interface VenueOrganization {
    uuid: string | null
    name: string
    web_link: string | null
    city: string | null
    country: string | null
}

export interface VenueSpace {
    uuid: string
    name: string
    type: string | null
    type_name: string | null

    description: string | null
    web_link: string | null

    building_level: number | null
    area_sqm: number | null
    total_capacity: number | null
    seating_capacity: number | null
}

export interface VenueImages {
    main_photo?: Image
}

export interface Venue {
    uuid: string
    name: string
    type: string
    type_name: string
    description?: string
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
    state?: string
    web_link?: string
    lon: number
    lat: number
    organization: VenueOrganization
    spaces: VenueSpace[]
    logos: LogoGroup
    images: VenueImages
}

export type VenueResponse = ApiResponse<Venue>