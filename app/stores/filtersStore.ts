import type { PresetDateRangeMode } from '@/utils/eventDateRange'

export const useFiltersStore = defineStore(
    'filters',
    () => {
        // UI state
        const filterType = ref<string | null>(null)

        // Event filters
        const eventCategories = ref<number[] | null>(null)
        const eventDateSpan = ref<PresetDateRangeMode | null>(null)
        const eventSearch = ref('')
        const eventDateStart = ref('')
        const eventDateEnd = ref('')
        const eventCity = ref('')
        const eventPostalCode = ref('')
        const eventVenue = ref('')
        const eventLocationFlag = ref(false)
        const eventLocationRadius = ref(3)
        const eventTypeIds = ref<string[]>([])
        const eventGenreIds = ref<string[]>([])

        function setFilter(type: string | null) {
            filterType.value = type
        }

        function resetFilters() {
            filterType.value = null
            eventCategories.value = null
            eventDateSpan.value = null
            eventSearch.value = ''
            eventDateStart.value = ''
            eventDateEnd.value = ''
            eventTypeIds.value = []
            eventGenreIds.value = []
        }

        const eventDateRange = computed(() => {
            if (eventDateSpan.value === 'range') {
                return {
                    startDate: eventDateStart.value,
                    endDate: eventDateEnd.value,
                }
            }
            if (!eventDateSpan.value || eventDateSpan.value === 'all') {
                return {
                    startDate: '',
                    endDate: '',
                }
            }
            return resolveEventDateRange(eventDateSpan.value)
        })

        const hasValidEvnetDateRange = computed(() => {
            if (eventDateSpan.value !== 'range') {
                return true
            }
            return !!eventDateStart.value || !!eventDateEnd.value
        })

        function setEventTypes(payload: {
            typeIds: string[],
            genreIds: string[]
        }) {
            eventTypeIds.value = payload.typeIds
            eventGenreIds.value = payload.genreIds
        }

        return {
            // UI state
            filterType,
            setFilter,

            // Event filters
            eventCategories,
            eventDateSpan,
            eventSearch,
            eventDateStart,
            eventDateEnd,
            eventCity,
            eventPostalCode,
            eventVenue,
            eventLocationFlag,
            eventLocationRadius,
            eventTypeIds,
            eventGenreIds,

            eventDateRange,
            hasValidEvnetDateRange,
            setEventTypes,

            resetFilters
        }
    },
    {
        persist: true,
    }
)