<template>
  <div class="kbts-events-view-layout">

    <!--pre v-if="apiResponse">{{ apiResponse.data.last_event_date_uuid }}</pre>
    <pre v-if="apiResponse">{{ apiResponse.data.last_event_start_at }}</pre-->

    <div class="kbts-events-view-grid">
      <EventCard
          v-for="event in events"
          :key="event.uuid"
          :event="event"
      />
    </div>

    <div
        v-if="showEmptyState"
        class="kbts-events-empty-state"
    >
      <h2>
        {{ emptyStateText }}
      </h2>

      <button
          v-if="hasActiveFilters"
          type="button"
          class="kbts-button"
          @click="resetEventFilters"
      >
        {{ t('event.filter.reset_filters') }}
      </button>
    </div>

    <div ref="loadTrigger" class="kbts-events-view-load-trigger">
    </div>

    <!--p v-if="loading">
      Loading more events...
    </p-->

    <!--p v-if="!hasMore">
      No more events
    </p-->

    <p v-if="error">
      Error: {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useFiltersStore } from '~/stores/filtersStore'
import type { CalendarEvent, CalendarEventsResponse } from '~/types/calendarEvent'
import { debounce } from '~/utils/debounce'

const PAGE_SIZE = 20
const props = withDefaults(
    defineProps<{
      venueUuid?: string
      useFilters?: boolean
    }>(),
    {
      useFilters: true
    }
)

const { t } = useI18n()
const { $api } = useNuxtApp()

const eventFilters = useFiltersStore()

const {
  eventCategories,
  eventDateSpan,
  eventDateRange,
  eventSearch,
  eventDateStart,
  eventDateEnd,
  eventCity,
  eventPostalCode,
  eventLocationFlag,
  eventLocationRadius,
  eventVenue,
  eventTypeIds,
  eventGenreIds,
  eventAgeFrom,
  eventAgeTo,
  eventPriceType,
  eventPriceCurrency,
  eventMaxPrice
} = storeToRefs(eventFilters)

const events = ref<CalendarEvent[]>([])
const summaryStore = useEventSummaryStore()
const {
  build,
  watchedFilters
} = useEventQueryParams()

const {
  totalEventCount
} = storeToRefs(summaryStore)

const loading = ref(false)
const resettingFilters = ref(false)
const hasMore = ref(true)
const cursor = ref<{
  date_uuid: string
  start_at: string
} | null>(null)

const loadTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()

  if (!loadTrigger.value) return

  observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry && entry.isIntersecting) {
          await loadEvents()
          setupObserver()
        }
      },
      {
        rootMargin: '300px'
      }
  )

  observer.observe(loadTrigger.value)
}


const error = ref<string | null>(null)

const hasActiveFilters = computed(() => {
  if (!props.useFilters) {
    return false
  }

  return Boolean(
      eventCategories.value?.length ||
      eventSearch.value.trim() ||
      eventDateRange.value.startDate ||
      eventDateRange.value.endDate ||
      eventCity.value.trim() ||
      eventPostalCode.value.trim() ||
      eventVenue.value.trim() ||
      eventLocationFlag.value ||
      eventTypeIds.value.length ||
      eventGenreIds.value.length ||
      eventAgeFrom.value ||
      eventAgeTo.value ||
      eventPriceType.value
  )
})

const showEmptyState = computed(
    () => !loading.value && !hasMore.value && events.value.length === 0
)

const emptyStateText = computed(() => {
  return hasActiveFilters.value
      ? t('event.no_filter_results')
      : t('event.no_events_in_system')
})

onMounted(async () => {
  await loadEvents()
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function resetEvents() {
  events.value = []
  cursor.value = null
  hasMore.value = true
}

async function resetEventFilters() {
  reloadEvents.cancel()
  resettingFilters.value = true
  eventFilters.resetFilters()

  await nextTick()

  resettingFilters.value = false
  resetEvents()
  await loadEvents()
}

async function loadEvents() {
  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const params = await build({
      includePagination: true,
      includeFilters: props.useFilters,
      venueUuids: props.venueUuid,
      limit: PAGE_SIZE,
      cursor: cursor.value
    })

    const url = `/api/events?${params}`
    const response = await $api<CalendarEventsResponse>(url)

    events.value.push(...response.data.events)

    if (response.data.events.length < PAGE_SIZE) {
      hasMore.value = false
    }

    cursor.value = {
      date_uuid: response.data.last_event_date_uuid,
      start_at: response.data.last_event_start_at
    }

  } finally {
    loading.value = false

    // force observer recalculation
    await nextTick()
  }
}


const reloadEvents = debounce(async () => {
  resetEvents()
  await loadEvents()
}, 500)

watch(
    [
      eventSearch,
      eventCity,
      eventPostalCode,
      eventLocationRadius,
      eventVenue,
      eventAgeFrom,
      eventAgeTo,
      eventDateStart,
      eventDateEnd,
    ],
    () => {
      if (!props.useFilters || resettingFilters.value) {
        return
      }

      reloadEvents()
    },
    { deep: true }
)

watch(
    [
      eventCategories,
      eventDateSpan,
      eventLocationFlag,
      eventTypeIds,
      eventGenreIds,
      eventPriceType,
      eventPriceCurrency,
      eventMaxPrice
    ],
    async () => {
      if (!props.useFilters || resettingFilters.value) {
        return
      }

      resetEvents()
      await loadEvents()
    },
    { deep: true }
)

watch(
    () => props.venueUuid,
    async () => {
      resetEvents()
      await loadEvents()
    }
)
</script>

<style scoped lang="scss">
.kbts-events-view-layout {
  padding: 1rem;
  h1 {
    font-size: 2rem;
    font-weight: 300;
  }
}

.kbts-events-view-grid{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  transition: opacity .2s ease;

  &.loading {
    opacity: .35;
    pointer-events: none;
  }
}

.kbts-events-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h2 {
    font-weight: 400;
    font-size: 2rem;
  }

  p {
    margin: 0;
    color: var(--kbts-muted-fg);
    font-size: 1rem;
  }

  .kbts-button {
    font-size: 1.2rem;
    padding: .8rem 1.6rem;
    width: fit-content;
    margin-inline: auto;
  }
}
</style>
