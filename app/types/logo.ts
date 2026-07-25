export interface LogoImage {
    uuid: string
    url: string
}

export interface LogoGroup {
    main_logo?: LogoImage
    light_theme_logo?: LogoImage
    dark_theme_logo?: LogoImage
}