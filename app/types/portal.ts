export interface Portal {
    uuid: string
    slug: string
    org_uuid: string
    name: string
    web_logo_url?: string | null
    footer_logo_url?: string | null
    config?: {
        style?: {
            logo?: {
                top_margin?: string | null
                bottom_margin?: string | null
            } | null
            nav_height?: string | null
        } | null
    } | null
}
