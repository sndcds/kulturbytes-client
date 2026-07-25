import type { PresetDateRangeMode } from '@/utils/eventDateRange'
import { cleanObject } from '~/utils/cleanObject'

type EventFilterPayload = {
    categories?: number[] | null

    date?: {
        span?: PresetDateRangeMode | null
        start?: string | null
        end?: string | null
    }

    search?: string | null

    location?: {
        city?: string | null
        postalCode?: string | null
        venue?: string | null
        useCurrentLocation?: boolean | null
        radius?: number | null
    }

    types?: number[] | null
    genres?: number[] | null

    age?: {
        from?: number | null
        to?: number | null
    }

    price?: {
        type?: string | null
        currency?: string | null
        max?: number | null
    }
}

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
        const eventTypeIds = ref<number[]>([])
        const eventGenreIds = ref<number[]>([])
        const eventAgeFrom = ref<number | null>(null)
        const eventAgeTo = ref<number | null>(null)
        const eventPriceType = ref<string | null>(null)
        const eventPriceCurrency = ref<string>('EUR')
        const eventMaxPrice = ref<number | null>(10)

        function setFilter(type: string | null) {
            filterType.value = type
        }

        function resetFilters() {
            eventCategories.value = null
            eventDateSpan.value = null
            eventSearch.value = ''
            eventDateStart.value = ''
            eventDateEnd.value = ''

            eventCity.value = ''
            eventPostalCode.value = ''
            eventVenue.value = ''

            eventLocationFlag.value = false
            eventLocationRadius.value = 3

            eventTypeIds.value = []
            eventGenreIds.value = []

            eventAgeFrom.value = null
            eventAgeTo.value = null

            eventPriceType.value = null
            eventPriceCurrency.value = 'EUR'
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
            typeIds: number[],
            genreIds: number[]
        }) {
            eventTypeIds.value = payload.typeIds
            eventGenreIds.value = payload.genreIds
        }

        function buildEventFilterPayload() {
            const payload = {
                categories: eventCategories.value,

                date: {
                    span: eventDateSpan.value,
                    start: eventDateStart.value,
                    end: eventDateEnd.value,
                },

                search: eventSearch.value,

                location: {
                    city: eventCity.value,
                    postalCode: eventPostalCode.value,
                    venue: eventVenue.value,

                    useCurrentLocation: eventLocationFlag.value,
                    radius: eventLocationRadius.value,
                },

                types: eventTypeIds.value,
                genres: eventGenreIds.value,

                age: {
                    from: eventAgeFrom.value,
                    to: eventAgeTo.value,
                },

                price: {
                    type: eventPriceType.value,
                    currency: eventPriceCurrency.value,
                    max: eventMaxPrice.value,
                },
            }


            return cleanObject(payload)
        }

        function applyEventFilterPayload(
            payload: EventFilterPayload
        ) {
            if ('categories' in payload) {
                eventCategories.value = payload.categories ?? null
            }

            if (payload.date) {
                eventDateSpan.value = payload.date.span ?? null
                eventDateStart.value = payload.date.start ?? ''
                eventDateEnd.value = payload.date.end ?? ''
            }

            if ('search' in payload) {
                eventSearch.value = payload.search ?? ''
            }

            if (payload.location) {
                eventCity.value = payload.location.city ?? ''
                eventPostalCode.value = payload.location.postalCode ?? ''
                eventVenue.value = payload.location.venue ?? ''

                eventLocationFlag.value =
                    payload.location.useCurrentLocation ?? false

                eventLocationRadius.value =
                    payload.location.radius ?? null
            }

            if ('types' in payload) {
                eventTypeIds.value = [
                    ...(payload.types ?? [])
                ]
            }

            if ('genres' in payload) {
                eventGenreIds.value = [
                    ...(payload.genres ?? [])
                ]
            }

            if (payload.age) {
                eventAgeFrom.value = payload.age.from ?? null
                eventAgeTo.value = payload.age.to ?? null
            }

            if (payload.price) {
                eventPriceType.value = payload.price.type ?? null
                eventPriceCurrency.value =
                    payload.price.currency ?? 'EUR'
                eventMaxPrice.value =
                    payload.price.max ?? null
            }
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

            resetFilters,

            buildEventFilterPayload,
            applyEventFilterPayload
        }
    },
    {
        persist: true,
    }
)