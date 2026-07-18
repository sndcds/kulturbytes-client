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
        const eventLocationRadius = ref<number | null>(3)
        const eventTypeIds = ref<string[]>([])
        const eventGenreIds = ref<string[]>([])
        const eventAgeFrom = ref<number | null>(null)
        const eventAgeTo = ref<number | null>(null)
        const eventPriceType = ref<string | null>(null)
        const eventPriceCurrency = ref<string>('EUR')
        const eventMaxPrice = ref<number | null>(10)

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
            eventAgeFrom.value = null
            eventAgeTo.value = null
            eventPriceType.value = null,
            eventPriceCurrency.value = 'EUR',
            eventMaxPrice.value = 10
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
            eventAgeFrom,
            eventAgeTo,
            eventPriceType,
            eventPriceCurrency,
            eventMaxPrice,

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