// composables/useTheme.ts

export type ThemeName = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const DEFAULT_THEME: ThemeName = 'light'


const isValidTheme = (
    value: unknown
): value is ThemeName =>
    value === 'light' ||
    value === 'dark'


export const useTheme = () => {

    const theme = useState<ThemeName>(
        'app-theme',
        () => DEFAULT_THEME
    )


    function applyTheme(
        value: ThemeName
    ) {
        theme.value = value

        if (import.meta.client) {
            document.documentElement.dataset.theme = value
        }
    }

    function getTheme(): ThemeName {
        return theme.value
    }

    function saveTheme() {
        if (!import.meta.client) {
            return
        }
        localStorage.setItem(STORAGE_KEY, theme.value)
    }

    function setTheme(value: ThemeName) {
        applyTheme(value)
        saveTheme()
    }

    function loadTheme() {
        if (!import.meta.client) {
            return
        }
        const stored = localStorage.getItem(STORAGE_KEY)
        applyTheme(isValidTheme(stored) ? stored : DEFAULT_THEME)
    }

    function toggleTheme() {
        setTheme(theme.value === 'dark' ? 'light' : 'dark')
    }

    const isLight = computed(
        () =>
            theme.value === 'light'
    )

    const isDark = computed(
        () =>
            theme.value === 'dark'
    )

    return {
        theme,

        isLight,
        isDark,

        getTheme,

        setTheme,
        toggleTheme,
        loadTheme,
    }
}