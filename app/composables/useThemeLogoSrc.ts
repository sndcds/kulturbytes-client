import { computed, unref, type MaybeRef } from 'vue'

interface UseThemeLogoSrcOptions {
    mainSrc?: MaybeRef<string | null | undefined>
    lightSrc?: MaybeRef<string | null | undefined>
    darkSrc?: MaybeRef<string | null | undefined>
    theme: MaybeRef<string>
}

export function useThemeLogoSrc(options: UseThemeLogoSrcOptions) {
    const themeLogoSrc = computed(() => {
        const theme = unref(options.theme)
        const main = unref(options.mainSrc)

        if (theme === 'dark') {
            return unref(options.darkSrc) ?? main ?? null
        }

        if (theme === 'light') {
            return unref(options.lightSrc) ?? main ?? null
        }

        return main ?? null
    })

    return {
        themeLogoSrc,
    }
}