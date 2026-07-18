/*
 app/stores/themeStore.ts
*/

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme, type ThemeMode } from '~/composables/useTheme'

export const useThemeStore = defineStore(
    'theme',
    () => {

        const theme = ref<ThemeMode>('light')

        const {
            applyTheme,
            saveTheme,
            getStoredTheme
        } = useTheme()


        function setTheme(newTheme: ThemeMode) {
            theme.value = newTheme

            if (import.meta.client) {
                applyTheme(newTheme)
                saveTheme(newTheme)
            }
        }


        function initTheme() {
            if (import.meta.client) {
                const stored = getStoredTheme()

                theme.value = stored
                applyTheme(stored)
            }
        }


        return {
            theme,
            setTheme,
            initTheme
        }

    },
    {
        persist: true
    }
)