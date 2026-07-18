// stores/eventSummaryStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNuxtApp } from '#app'

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

    const loading = ref(false)
    const error = ref<string | null>(null)

    const totalEventCount = ref(0)
    const typeSummary = ref<SummaryItem[]>([])
    const genreSummary = ref<SummaryItem[]>([])

    const {
        build,
        watchedFilters
    } = useEventQueryParams()

    async function buildParams() {
        const params = await build()
        return params
    }

    async function loadSummary() {
        loading.value = true
        error.value = null

        try {
            const params = await buildParams()
            const response = await $api<EventSummaryResponse>(
                `/api/events/type-summary?${params}`
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
        watchedFilters,
        loadSummary,
        {
            deep: true,
            immediate: true
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