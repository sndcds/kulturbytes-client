import { computed, type Ref } from 'vue'

interface UseLogoUrlOptions {
    logoURL?: Ref<string | null | undefined>
    lightThemeLogoURL?: Ref<string | null | undefined>
    darkThemeLogoURL?: Ref<string | null | undefined>

    theme: Ref<string>

    plutoWidth?: number
    maxWidth?: number
    maxHeight?: number

    type?: string
    quality?: number
}

export function useLogoUrl(options: UseLogoUrlOptions) {
    const {
        logoURL,
        lightThemeLogoURL,
        darkThemeLogoURL,
        theme,
    } = options

    const logoUrl = computed(() => {
        const isDark = theme.value === 'dark'

        const themeLogo = isDark
            ? darkThemeLogoURL?.value
            : lightThemeLogoURL?.value

        return themeLogo || logoURL?.value || null
    })

    return {
        logoUrl,
    }
}