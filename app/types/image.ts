export type ImageAiLabel = 'none' | 'ai' | 'ai_generated' | 'ai_modified'

export interface Image {
    uuid: string
    identifier: string
    url: string

    ai_label?: ImageAiLabel | null
    alt?: string
    width?: number
    height?: number

    creator?: string
    copyright?: string
    description?: string

    license?: string
    license_name?: string
    license_description?: string

    focus_x?: number
    focus_y?: number
}