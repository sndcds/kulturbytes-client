import { storeToRefs } from 'pinia'
import { useFiltersStore } from '~/stores/filtersStore'
import { getCurrentGeoPosition } from '~/utils/geoLocation'

interface BuildOptions {
    includePagination?: boolean
    includeFilters?: boolean
    venueUuids?: string
    limit?: number
    cursor?: {
        date_uuid: string
        start_at: string
    } | null
}

export function useEventQueryParams() {
    const filters = useFiltersStore()

    const {
        eventCategories,
        eventSearch,
        eventDateRange,
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
        eventMaxPrice,
        eventPriceCurrency,
    } = storeToRefs(filters)

    const watchedFilters = computed(() => ({
        eventCategories: eventCategories.value,
        eventSearch: eventSearch.value,
        eventDateRange: eventDateRange.value,
        eventCity: eventCity.value,
        eventPostalCode: eventPostalCode.value,
        eventVenue: eventVenue.value,
        eventLocationFlag: eventLocationFlag.value,
        eventLocationRadius: eventLocationRadius.value,
        eventTypeIds: eventTypeIds.value,
        eventGenreIds: eventGenreIds.value,
        eventAgeFrom: eventAgeFrom.value,
        eventAgeTo: eventAgeTo.value,
        eventPriceType: eventPriceType.value,
        eventMaxPrice: eventMaxPrice.value,
        eventPriceCurrency: eventPriceCurrency.value,
    }))

    async function build(options: BuildOptions = {}) {
        const params = new URLSearchParams()

        if (options.includePagination) {
            params.append('limit', String(options.limit ?? 20))

            if (options.cursor) {
                params.append(
                    'last_event_date_uuid',
                    options.cursor.date_uuid
                )

                params.append(
                    'last_event_start_at',
                    options.cursor.start_at
                )
            }
        }

        if (options.venueUuids) {
            params.append('venue_uuids', options.venueUuids)
        }

        if (options.includeFilters === false) {
            return params
        }

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

        if (eventVenue.value) {
            params.append('venue', eventVenue.value + '*')
        }

        if (eventLocationFlag.value) {
            try {
                const position = await getCurrentGeoPosition()

                params.append('lat', position.coords.latitude.toString())
                params.append('lon', position.coords.longitude.toString())
                if (eventLocationRadius.value) {
                    params.append(
                        'radius', String(eventLocationRadius.value * 1000)
                    )
                }
            } catch (err) {
                console.error(err)
            }
        }

        if (eventTypeIds.value.length === 1) {
            const typeId = eventTypeIds.value[0]

            if (typeId !== undefined) {
                if (eventGenreIds.value.length) {
                    params.append(
                        'genres',
                        eventGenreIds.value.join(',')
                    )
                } else {
                    params.append(
                        'event_types',
                        String(typeId)
                    )
                }
            }
        }

        const age =
            eventAgeFrom.value && eventAgeTo.value
                ? `${eventAgeFrom.value},${eventAgeTo.value}`
                : eventAgeFrom.value || eventAgeTo.value

        if (age) {
            params.append('age', String(age))
        }

        if (eventPriceType.value === 'max_price') {
            if (eventMaxPrice.value) {
                params.append('price', String(eventMaxPrice.value) + ',' + eventPriceCurrency.value)
            }
        } else if (eventPriceType.value) {
            params.append('price', eventPriceType.value)
        }

        return params
    }

    return {
        build,
        watchedFilters
    }
}
