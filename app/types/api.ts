// types/api.ts

export interface ApiMetadata {
    response_time_ms: number
}

export interface ApiResponse<T> {
    service: string
    api_version: string
    response_type: string
    status: number
    timestamp: string

    metadata: ApiMetadata

    data: T
}