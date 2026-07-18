export interface EventsResponse {
    service: string
    api_version: string
    response_type: string
    status: number
    timestamp: string
    metadata: {
        response_time_ms: number
    }
    data: {
        events: Event[],
        last_event_date_uuid: string
        last_event_start_at: string
    }
}