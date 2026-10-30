import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useFiltersStore } from '~/stores/filtersStore'
import { getCurrentGeoPosition } from '~/utils/geoLocation'
import type { EventPaginationCursor } from '~/types/calendarEvent'

interface BuildOptions {
    filterSnapshot?: EventQuerySnapshot
    includePagination?: boolean
    includeFilters?: boolean
    venueUuids?: string
    limit?: number
    referenceDate?: string
    cursor?: EventPaginationCursor | null
}

export function useEventQueryParams() {
    const filters = useFiltersStore()

    const {
        eventCategories,
        eventDateSpan,
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
        eventPortalUuid,
    } = storeToRefs(filters)

    const watchedFilters = computed(() => ({
        eventCategories: eventCategories.value,
        eventDateSpan: eventDateSpan.value,
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
        eventPortalUuid: eventPortalUuid.value,
    }))

    // Capture all fields before any asynchronous geolocation work.
    function getSnapshot() {
        const current = watchedFilters.value
        return {
            ...current,
            eventCategories: current.eventCategories ? [...current.eventCategories] : null,
            eventDateRange: { ...current.eventDateRange },
            eventTypeIds: [...current.eventTypeIds],
            eventGenreIds: [...current.eventGenreIds],
        }
    }

    const filterKey = computed(() => JSON.stringify(getSnapshot()))

    async function build(options: BuildOptions = {}) {
        const snapshot = options.filterSnapshot ?? getSnapshot()
        const params = new URLSearchParams()

        if (options.includePagination) {
            params.append('limit', String(options.limit ?? 20))

            if (options.cursor) {
                params.append('last_event_date_uuid', options.cursor.date_uuid)
                params.append('last_event_start_at', options.cursor.start_at)
            }
        }

        const filterStart = options.includeFilters === false
            ? undefined
            : snapshot.eventDateRange.startDate || undefined
        const start = options.includePagination
            ? options.cursor?.reference_date ?? filterStart ?? options.referenceDate
            : filterStart
        if (start) {
            params.append('start', start)
        }

        if (options.venueUuids) {
            params.append('venue_uuids', options.venueUuids)
        }

        if (options.includeFilters === false) {
            return params
        }

        if (snapshot.eventPortalUuid) {
            params.append('portal', snapshot.eventPortalUuid)
        }

        if (snapshot.eventCategories?.length) {
            params.append('categories', snapshot.eventCategories.join(','))
        }

        if (snapshot.eventSearch) {
            params.append('search', snapshot.eventSearch)
        }

        if (snapshot.eventDateRange.endDate) {
            params.append('end', snapshot.eventDateRange.endDate)
        }

        if (snapshot.eventCity) {
            params.append('city', snapshot.eventCity + '*')
        }

        if (snapshot.eventPostalCode) {
            params.append('postal_code', snapshot.eventPostalCode + '*')
        }

        if (snapshot.eventVenue) {
            const venues = snapshot.eventVenue
                .split(',')
                .map(v => `*${v.trim()}*`)
                .join(',')
            params.append('venue', venues)
        }

        if (snapshot.eventLocationFlag) {
            try {
                const position = await getCurrentGeoPosition()

                params.append('lat', position.coords.latitude.toString())
                params.append('lon', position.coords.longitude.toString())
                if (snapshot.eventLocationRadius) {
                    params.append(
                        'radius', String(snapshot.eventLocationRadius * 1000)
                    )
                }
            } catch (err) {
                console.error(err)
            }
        }

        if (snapshot.eventTypeIds.length === 1) {
            const typeId = snapshot.eventTypeIds[0]

            if (typeId !== undefined) {
                if (snapshot.eventGenreIds.length) {
                    params.append(
                        'genres',
                        snapshot.eventGenreIds.join(',')
                    )
                } else {
                    params.append(
                        'event_types',
                        String(typeId)
                    )
                }
            }
        }

        const hasAgeFrom = Number.isFinite(snapshot.eventAgeFrom)
        const hasAgeTo = Number.isFinite(snapshot.eventAgeTo)
        const age =
            hasAgeFrom && hasAgeTo
                ? `${snapshot.eventAgeFrom},${snapshot.eventAgeTo}`
                : hasAgeFrom ? snapshot.eventAgeFrom : hasAgeTo ? snapshot.eventAgeTo : null

        if (age !== null) {
            params.append('age', String(age))
        }

        if (snapshot.eventPriceType === 'max_price') {
            if (Number.isFinite(snapshot.eventMaxPrice)) {
                params.append('price', String(snapshot.eventMaxPrice) + ',' + snapshot.eventPriceCurrency)
            }
        } else if (snapshot.eventPriceType) {
            params.append('price', snapshot.eventPriceType)
        }

        return params
    }

    return {
        build,
        watchedFilters,
        getSnapshot,
        filterKey,
    }
}

export type EventQuerySnapshot = ReturnType<ReturnType<typeof useEventQueryParams>['getSnapshot']>
