import type { Image } from '~/types/image'

export type EventsDateRangeMode =
    'all' | 'today' | 'tomorrow' | 'weekend' | 'next_week' | 'weekend_after' | 'range'


export interface CalendarEvent {
    uuid: string
    date_uuid: string
    date_slug: string
    image_path: string
    title: string
    subtitle: string
    summary: string
    start_date: string
    start_time: string
    end_date: string
    end_time: string
    all_day: boolean
    space_uuid: string
    space_name: string
    venue_uuid: string
    venue_name: string
    venue_city: string
    price_type: string
}

export interface EventDate {
    uuid: string
    slug: string
    event_uuid: string
    release_status: string

    start_date: string
    start_time: string
    end_date: string
    end_time: string
    entry_time: string
    all_day: boolean

    venue_uuid: string
    venue_name: string
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_city: string
    venue_country: string
    venue_state: string
    venue_lon: number
    venue_lat: number
    space_name: string

    accessibility_labels: string[]
}

export interface EventItem {
    uuid: string
    release_status: string
    title: string
    subtitle: string
    description: string
    summary: string
    tags: string[]

    org_uuid: string
    org_name: string
    org_web_link: string
    org_logos: {
        main_logo: {
            uuid: string
            url: string
        }
    }

    images: {
        main: Image
    }

    event_types: {
        type_id: number
        type_name: string
        genre_id: number
        genre_name: string
    }[]

    online_link: string
    meeting_point: string

    source_link: string,
    event_links: {
        label: string
        type: string
        url: string
    }[]

    date: EventDate
    further_dates: EventDate[]

    registration_link: string
    registration_email: string
    registration_phone: string
    registration_deadline: string

    visitor_info_flags: string
    participation_info: string,
    max_attendees: number,
    min_age: number,
    max_age: number,
    price_type: string,
    currency: string,
    min_price: number,
    max_price: number,
    ticket_flags: string[]
    ticket_link: string
}

export interface EventResponse {
    service: string
    api_version: string
    response_type: string
    status: number
    timestamp: string

    metadata: {
        date_identifier: string
        date_uuid: string
        event_date_count: number
        event_uuid: string
        lang: string
        response_time_ms: number
    }

    data: Event
}