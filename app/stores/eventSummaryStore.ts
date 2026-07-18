// stores/eventSummaryStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNuxtApp } from '#app'
import { useFiltersStore } from '~/stores/filtersStore'
import { getCurrentGeoPosition } from '~/utils/geoLocation'

interface SummaryItem {
    id: number
    count: number
}

interface EventSummaryResponse {
    data: {
        total_event_count: number
        type_summary: SummaryItem[]
        genre_summary: SummaryItem[]
    }
}

export const useEventSummaryStore = defineStore('eventSummary', () => {
    const { $api } = useNuxtApp()

    const filters = useFiltersStore()

    const {
        eventCategories,
        eventSearch,
        eventDateRange,
        eventCity,
        eventPostalCode,
        eventLocationFlag,
        eventLocationRadius,
        eventTypeIds,
        eventGenreIds,
    } = storeToRefs(filters)

    const loading = ref(false)
    const error = ref<string | null>(null)

    const totalEventCount = ref(0)
    const typeSummary = ref<SummaryItem[]>([])
    const genreSummary = ref<SummaryItem[]>([])

    async function buildParams() {
        const params = new URLSearchParams()

        if (eventCategories.value?.length) {
            params.append('categories', eventCategories.value.join(','))
        }

        if (eventSearch.value) {
            params.append('search', eventSearch.value)
        }

        if (eventDateRange.value.startDate) {
            params.append('start', eventDateRange.value.startDate)
        }

        if (eventDateRange.value.endDate) {
            params.append('end', eventDateRange.value.endDate)
        }

        if (eventCity.value) {
            params.append('city', eventCity.value + '*')
        }

        if (eventPostalCode.value) {
            params.append('postal_code', eventPostalCode.value + '*')
        }

        if (eventLocationFlag.value) {
            try {
                const position = await getCurrentGeoPosition()

                params.append('lat', position.coords.latitude.toString())
                params.append('lon', position.coords.longitude.toString())
                params.append(
                    'radius',
                    (eventLocationRadius.value * 1000).toString()
                )
            } catch (e) {
                console.error(e)
            }
        }

        if (eventTypeIds.value.length) {
            params.append('event_types', eventTypeIds.value.join(','))
        }

        if (eventGenreIds.value.length) {
            params.append('genres', eventGenreIds.value.join(','))
        }

        return params
    }

    async function loadSummary() {
        loading.value = true
        error.value = null

        try {
            const params = await buildParams()

            const response = await $api<EventSummaryResponse>(
                `/api/events/type-summary?${params.toString()}`
            )

            totalEventCount.value = response.data.total_event_count
            typeSummary.value = response.data.type_summary
            genreSummary.value = response.data.genre_summary
        } catch (err) {
            console.error(err)
            error.value = 'Failed to load event summary'
        } finally {
            loading.value = false
        }
    }

    watch(
        [
            eventSearch,
            eventCategories,
            eventDateRange,
            eventCity,
            eventPostalCode,
            eventLocationFlag,
            eventLocationRadius,
            eventTypeIds,
            eventGenreIds,
        ],
        loadSummary,
        {
            deep: true,
        }
    )

    return {
        loading,
        error,
        totalEventCount,
        typeSummary,
        genreSummary,
        loadSummary,
    }
})