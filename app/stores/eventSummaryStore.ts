import { defineStore } from 'pinia'
import { ref, watch, onScopeDispose } from 'vue'
import { useNuxtApp } from '#app'
import { useEventQueryParams } from '~/composables/useEventQueryParams'

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
    const { build, filterKey, getSnapshot } = useEventQueryParams()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const totalEventCount = ref<number | null>(null)
    const typeSummary = ref<SummaryItem[]>([])
    const genreSummary = ref<SummaryItem[]>([])

    let version = 0
    let controller: AbortController | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let loadedKey: string | undefined
    let pending: { key: string, promise: Promise<void> } | undefined

    function invalidate() {
        version++
        controller?.abort()
        clearTimeout(timer)
        pending = undefined
        totalEventCount.value = null
        typeSummary.value = []
        genreSummary.value = []
        error.value = null
        loading.value = true
    }

    function loadSummary(): Promise<void> {
        clearTimeout(timer)
        const key = filterKey.value
        if (pending?.key === key) return pending.promise
        if (loadedKey === key && totalEventCount.value !== null) return Promise.resolve()

        invalidate()
        const requestVersion = version
        const snapshot = getSnapshot()
        controller = new AbortController()
        const signal = controller.signal
        const promise = (async () => {
            try {
                const params = await build({ filterSnapshot: snapshot })
                if (requestVersion !== version) return
                const response = await $api<EventSummaryResponse>(
                    `/api/events/type-summary?${params}`, { signal }
                )
                if (requestVersion !== version) return
                totalEventCount.value = response.data.total_event_count
                typeSummary.value = response.data.type_summary
                genreSummary.value = response.data.genre_summary
                loadedKey = key
            } catch {
                if (requestVersion !== version) return
                error.value = 'Failed to load event summary'
            } finally {
                if (requestVersion === version) {
                    loading.value = false
                    pending = undefined
                }
            }
        })()
        pending = { key, promise }
        return promise
    }

    if (import.meta.client) {
        watch(filterKey, (key, previousKey) => {
            invalidate()
            const current = JSON.parse(key)
            const previous = previousKey ? JSON.parse(previousKey) : null
            const textChanged = previous && [
                'eventSearch', 'eventCity', 'eventPostalCode', 'eventVenue',
            ].some(field => current[field] !== previous[field])
            // Batch non-text changes in one turn, including reset.
            timer = setTimeout(() => void loadSummary(), textChanged ? 300 : 0)
        }, { immediate: true, flush: 'sync' })
    }

    onScopeDispose(() => {
        version++
        clearTimeout(timer)
        controller?.abort()
    })

    return { loading, error, totalEventCount, typeSummary, genreSummary, loadSummary }
})
