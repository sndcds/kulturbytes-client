import { computed } from 'vue'
import { useFiltersStore } from '~/stores/filtersStore'
import { useEventFilterEditingStore } from '~/stores/eventFilterEditingStore'
import { useEventTypeStore } from '~/stores/eventTypesStore'
import { eventCategories } from '~/utils/eventCategories'
import { formatDate } from '~/utils/formatDate'

export function useActiveEventFilters() {
    const filters = useFiltersStore()
    const editing = useEventFilterEditingStore()
    const eventTypes = useEventTypeStore()
    const { t, locale } = useI18n()

    const chips = computed(() => {
        const current = editing.appliedFilters
        const result: { id: string, label: string, remove: () => void }[] = []
        const add = (id: string, label: string, remove: () => void) => result.push({ id, label, remove })

        for (const id of current.eventCategories ?? []) {
            const category = eventCategories.find(category => category.id === id)
            add(`category-${id}`, category ? t(category.label) : String(id), () => {
                const remaining = filters.eventCategories?.filter(categoryId => categoryId !== id)
                filters.eventCategories = remaining?.length ? remaining : null
            })
        }

        if (current.eventSearch.trim()) {
            add('search', `${t('filter.search')}: ${current.eventSearch.trim()}`, () => { filters.eventSearch = '' })
        }

        const { startDate, endDate } = current.eventDateRange
        if (startDate || endDate) {
            const label = current.eventDateSpan === 'range'
                ? [
                    startDate && `${t('event.filter.date_from')} ${formatDate(locale.value, startDate)}`,
                    endDate && `${t('event.filter.date_to')} ${formatDate(locale.value, endDate)}`,
                ].filter(Boolean).join(' – ')
                : t(`event.date_span.${current.eventDateSpan}`)
            add('date', label, () => {
                filters.eventDateSpan = null
                filters.eventDateStart = ''
                filters.eventDateEnd = ''
            })
        }

        const textFilters = [
            ['city', 'eventCity', 'event.filter.city'],
            ['postal-code', 'eventPostalCode', 'event.filter.postal_code'],
            ['venue', 'eventVenue', 'event.filter.venue_name'],
        ] as const
        for (const [id, field, label] of textFilters) {
            if (current[field].trim()) {
                add(id, `${t(label)}: ${current[field].trim()}`, () => { filters[field] = '' })
            }
        }

        if (current.eventLocationFlag) {
            const label = current.eventLocationRadius
                ? t('filter.current_location_radius', { radius: current.eventLocationRadius })
                : t('filter.current_location')
            add('location', label, () => {
                filters.eventLocationFlag = false
                filters.eventLocationRadius = 3
            })
        }

        for (const id of current.eventTypeIds) {
            const type = eventTypes.getType(id, locale.value)
            add(`type-${id}`, type?.name ?? t('filter.event_type', { id }), () => {
                filters.eventTypeIds = filters.eventTypeIds.filter(typeId => typeId !== id)
                // Genres belong to the selected type, as in TypeGenreSelect.
                filters.eventGenreIds = []
            })
        }
        if (current.eventTypeIds.length === 1) {
            for (const id of current.eventGenreIds) {
                const genre = eventTypes.getGenre(current.eventTypeIds[0]!, id, locale.value)
                add(`genre-${id}`, genre?.name ?? t('filter.event_genre', { id }), () => {
                    filters.eventGenreIds = filters.eventGenreIds.filter(genreId => genreId !== id)
                })
            }
        }

        if (current.eventAgeFrom !== null && Number.isFinite(current.eventAgeFrom)) {
            add('age-from', t('event.age_from', { age: current.eventAgeFrom }), () => { filters.eventAgeFrom = null })
        }
        if (current.eventAgeTo !== null && Number.isFinite(current.eventAgeTo)) {
            add('age-to', t('event.age_until', { age: current.eventAgeTo }), () => { filters.eventAgeTo = null })
        }

        if (current.eventPriceType) {
            const labels: Record<string, string> = {
                free: 'event.price_free',
                donation: 'event.price_donation',
                max_price: 'event.filter.max_price',
            }
            let label = t(labels[current.eventPriceType] ?? 'event.filter.price')
            if (current.eventPriceType === 'max_price' && current.eventMaxPrice !== null && Number.isFinite(current.eventMaxPrice)) {
                const price = new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(current.eventMaxPrice)
                label = `${label}: ${price} ${current.eventPriceCurrency}`
            }
            add('price', label, () => {
                filters.eventPriceType = null
                filters.eventMaxPrice = 10
                filters.eventPriceCurrency = 'EUR'
            })
        }

        return result
    })

    return { chips }
}
