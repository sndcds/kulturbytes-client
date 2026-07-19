// types/event.ts

export interface CalendarEventType {
    type_id: number
    genre_id: number
}

export interface CalendarEvent {
    uuid: string
    date_uuid: string
    date_slug: string

    title: string
    subtitle: string
    summary: string

    start_date: string
    start_time: string
    end_date: string
    end_time: string
    all_day?: boolean

    space_uuid?: string
    space_name?: string

    venue_uuid: string
    venue_name: string
    venue_city: string
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_state: string
    venue_country: string
    venue_lat: number
    venue_lon: number

    image_uuid?: string
    image_path?: string

    org_uuid: string
    org_name: string

    categories: number[]
    event_types: CalendarEventType[]
    languages: string[]
    tags: string[]

    min_age: number | null
    max_age: number | null

    price_type: string | null
    visitor_info_flags: string

    release_status:
        | 'draft'
        | 'review'
        | 'released'
        | 'cancelled'
        | 'deferred'
        | 'rescheduled'
}

export interface CalendarEventsData {
    events: CalendarEvent[]
    last_event_date_uuid: string
    last_event_start_at: string
}

export interface UranusApiMetadata {
    response_time_ms: number
}

export interface CalendarEventsResponse {
    service: string
    api_version: string
    response_type: 'get-events'
    status: number
    timestamp: string
    metadata: UranusApiMetadata
    data: CalendarEventsData
}