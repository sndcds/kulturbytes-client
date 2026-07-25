/*
 app/stores/themeStore.ts
*/

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useTheme, type ThemeName } from '~/composables/useTheme'


export const useThemeStore = defineStore(
    'theme',
    () => {

        const {
            theme,
            setTheme,
            toggleTheme,
            loadTheme,
        } = useTheme()

        const isLight =
            computed(
                () =>
                    theme.value === 'light'
            )

        const isDark =
            computed(
                () =>
                    theme.value === 'dark'
            )

        function initTheme() {
            loadTheme()
        }

        return {
            theme,

            isLight,
            isDark,

            setTheme,
            toggleTheme,
            initTheme,
        }
    }
)