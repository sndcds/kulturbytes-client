import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Language {
    id: string
    name: string
}

export interface LanguageLookupResponse {
    service: string
    api_version: string
    response_type: string
    status: number
    timestamp: string

    metadata: {
        language: string
        response_time_ms: number
    }

    data: Language[]
}

export const useLanguageLookupStore = defineStore(
    'languageLookup',
    () => {

        const languages = ref<Record<string, Language[]>>({})

        const loaded = ref(false)
        const loading = ref(false)
        const error = ref<string | null>(null)


        async function fetchLanguages(
            lang = 'de',
            force = false
        ) {
            if (languages.value[lang] && !force) {
                return
            }

            if (loading.value) {
                return
            }

            const { $api } = useNuxtApp()

            loading.value = true
            error.value = null

            try {
                const response =
                    await $api<LanguageLookupResponse>(
                        '/api/choosable-languages',
                        {
                            query: {
                                lang
                            }
                        }
                    )

                languages.value[lang] =
                    response.data.sort((a, b) =>
                        a.name.localeCompare(
                            b.name,
                            lang
                        )
                    )

            } catch (err) {
                error.value =
                    'Failed to load languages'

                console.error(
                    'Failed loading languages:',
                    err
                )

            } finally {
                loading.value = false
            }
        }


        function getLanguages(
            lang = 'de'
        ): Language[] {
            return languages.value[lang] ?? []
        }


        function labelForLanguage(
            languageId: string,
            lang = 'de'
        ): string {
            return (
                getLanguages(lang)
                    .find(
                        language =>
                            language.id === languageId
                    )
                    ?.name
                ?? languageId
            )
        }


        function getLanguage(
            languageId: string,
            lang = 'de'
        ): Language | undefined {
            return getLanguages(lang)
                .find(
                    language =>
                        language.id === languageId
                )
        }


        return {
            languages,

            loaded,
            loading,
            error,

            fetchLanguages,

            getLanguages,
            getLanguage,
            labelForLanguage,
        }
    }
)