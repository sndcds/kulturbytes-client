import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useEventQueryParams, type EventQuerySnapshot } from '~/composables/useEventQueryParams'

// Deliberately not persisted: existing filter fields act as the mobile draft.
// Event requests keep the applied snapshot until the editing session finishes.
export const useEventFilterEditingStore = defineStore('eventFilterEditing', () => {
    const isMobileFilterEditing = ref(false)
    const appliedSnapshot = ref<EventQuerySnapshot | null>(null)
    const scrollPosition = ref<{ x: number, y: number } | null>(null)
    const showResultsAfterLoading = ref(false)
    const { getSnapshot } = useEventQueryParams()
    const appliedFilters = computed(() => appliedSnapshot.value ?? getSnapshot())

    function beginMobileFilterEditing() {
        if (isMobileFilterEditing.value) return
        scrollPosition.value = null
        showResultsAfterLoading.value = false
        appliedSnapshot.value = getSnapshot()
        isMobileFilterEditing.value = true
    }

    function finishMobileFilterEditing() {
        if (!isMobileFilterEditing.value) return
        appliedSnapshot.value = null
        isMobileFilterEditing.value = false
    }

    function setScrollPosition(position: { x: number, y: number } | null) {
        scrollPosition.value = position
        showResultsAfterLoading.value = false
    }

    function showResultsOnApply() {
        scrollPosition.value = null
        showResultsAfterLoading.value = true
    }

    function restoreScrollPosition(resultsElement: HTMLElement | null) {
        if (isMobileFilterEditing.value) return
        if (showResultsAfterLoading.value && resultsElement) {
            showResultsAfterLoading.value = false
            resultsElement.focus({ preventScroll: true })
            resultsElement.scrollIntoView({ block: 'start' })
            return
        }
        if (!scrollPosition.value) return
        const { x, y } = scrollPosition.value
        scrollPosition.value = null
        window.scrollTo(x, y)
    }

    return {
        isMobileFilterEditing, appliedSnapshot, appliedFilters, scrollPosition, showResultsAfterLoading,
        beginMobileFilterEditing, finishMobileFilterEditing, setScrollPosition, showResultsOnApply, restoreScrollPosition,
    }
})
