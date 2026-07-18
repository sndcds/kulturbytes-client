// composables/useTheme.ts

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'theme'

export const useTheme = () => {
    const theme = useState<ThemeMode>('theme', () => 'light')

    const applyTheme = (mode: ThemeMode) => {
        theme.value = mode

        if (import.meta.client) {
            document.documentElement.dataset.theme = mode
        }
    }

    const loadTheme = () => {
        if (import.meta.server) return

        const stored = localStorage.getItem(THEME_KEY)

        if (stored === 'light' || stored === 'dark') {
            applyTheme(stored)
        } else {
            applyTheme('light')
        }
    }

    const saveTheme = () => {
        if (import.meta.client) {
            localStorage.setItem(THEME_KEY, theme.value)
        }
    }

    const toggleTheme = () => {
        applyTheme(theme.value === 'dark' ? 'light' : 'dark')
        saveTheme()
    }

    const isLight = computed(() => theme.value === 'light')
    const isDark = computed(() => theme.value === 'dark')

    return {
        theme,
        isLight,
        isDark,
        applyTheme,
        loadTheme,
        saveTheme,
        toggleTheme,
    }
}