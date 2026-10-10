import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useEventQueryParams, type EventQuerySnapshot } from '~/composables/useEventQueryParams'

// Deliberately not persisted: existing filter fields act as the mobile draft.
// Event requests keep the applied snapshot until the editing session finishes.
export const useEventFilterEditingStore = defineStore('eventFilterEditing', () => {
    const isMobileFilterEditing = ref(false)
    const appliedSnapshot = ref<EventQuerySnapshot | null>(null)
    const { getSnapshot } = useEventQueryParams()
    const appliedFilters = computed(() => appliedSnapshot.value ?? getSnapshot())

    function beginMobileFilterEditing() {
        if (isMobileFilterEditing.value) return
        appliedSnapshot.value = getSnapshot()
        isMobileFilterEditing.value = true
    }

    function finishMobileFilterEditing() {
        if (!isMobileFilterEditing.value) return
        appliedSnapshot.value = null
        isMobileFilterEditing.value = false
    }

    return { isMobileFilterEditing, appliedFilters, beginMobileFilterEditing, finishMobileFilterEditing }
})
