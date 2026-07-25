import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface EventGenre {
    id: number
    name: string
}

export interface EventType {
    id: number
    name: string
    genres: EventGenre[]
}

export interface EventTypeLookupResponse {
    service: string
    api_version: string
    response_type: string
    status: number
    timestamp: string

    data: {
        [locale: string]: {
            types: {
                [typeId: number]: {
                    name: string
                    genres: {
                        [genreId: number]: string
                    }
                }
            }
        }
    }
}

export const useEventTypeStore = defineStore('eventTypes', () => {
    const types = ref<Record<string, EventType[]>>({})
    const loaded = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchTypes(force = false) {
        if (loaded.value && !force) {
            return
        }

        if (loading.value) {
            return
        }

        const { $api } = useNuxtApp()

        loading.value = true
        error.value = null

        try {
            const response = await $api<EventTypeLookupResponse>(
                '/api/event/type-genre-lookup'
            )
            types.value = mapLookup(response.data)
            loaded.value = true
        } catch (err) {
            error.value = 'Failed to load event types'
            console.error(
                'Failed loading event type lookup:',
                err
            )
        } finally {
            loading.value = false
        }
    }


    function mapLookup(
        data: EventTypeLookupResponse['data']
    ): Record<string, EventType[]> {

        const result: Record<string, EventType[]> = {}

        Object.entries(data).forEach(([locale, localeData]) => {

            result[locale] =
                Object.entries(localeData.types)
                    .map(([typeId, type]) => ({
                        id: Number(typeId),
                        name: type.name,
                        genres:
                            Object.entries(type.genres ?? {})
                                .map(([genreId, name]) => ({
                                    id: Number(genreId),
                                    name
                                }))
                                .sort((a, b) =>
                                    a.name.localeCompare(
                                        b.name,
                                        locale
                                    )
                                )
                    }))
                    .sort((a, b) =>
                        a.name.localeCompare(
                            b.name,
                            locale
                        )
                    )
        })

        return result
    }

    function getTypes(locale = 'en'): EventType[] {
        return types.value[locale] ?? []
    }

    function getType(
        typeId: number,
        locale = 'en'
    ): EventType | undefined {
        return getTypes(locale)
            .find(type => type.id === typeId)
    }

    function getGenre(
        typeId: number,
        genreId: number,
        locale = 'en'
    ): EventGenre | undefined {
        return getType(typeId, locale)
            ?.genres
            .find(genre => genre.id === genreId)
    }

    return {
        types,
        loaded,
        loading,
        error,

        fetchTypes,

        getTypes,
        getType,
        getGenre
    }
})