<template>
  <div ref="resultsElement" class="kbts-events-view-layout" data-event-results tabindex="-1">

    <ActiveEventFilters v-if="props.useFilters" @reset="resetEventFilters" />

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
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useFiltersStore } from '~/stores/filtersStore'
import type { CalendarEvent, CalendarEventsResponse } from '~/types/calendarEvent'
import { debounce } from '~/utils/debounce'
import { useEventFilterEditingStore } from '~/stores/eventFilterEditingStore'
import { useEventQueryParams } from '~/composables/useEventQueryParams'
import ActiveEventFilters from '~/components/filters/ActiveEventFilters.vue'

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
  eventCity,
  eventPostalCode,
  eventLocationFlag,
  eventVenue,
  eventTypeIds,
  eventGenreIds,
  eventAgeFrom,
  eventAgeTo,
  eventPriceType,
} = storeToRefs(eventFilters)

const events = ref<CalendarEvent[]>([])
const resultsElement = ref<HTMLElement | null>(null)
const editingStore = useEventFilterEditingStore()
const { build, filterKey, getSnapshot } = useEventQueryParams()
const requestsPaused = computed(() => editingStore.isMobileFilterEditing)
let requestVersion = 0
let requestController: AbortController | undefined
let disposed = false

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

  if (requestsPaused.value || disposed || loading.value || error.value || !hasMore.value || !loadTrigger.value) return

  observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry && entry.isIntersecting) {
          await loadEvents()
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
      Number.isFinite(eventAgeFrom.value) ||
      Number.isFinite(eventAgeTo.value) ||
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
  disposed = true
  reloadEvents.cancel()
  invalidateRequest()
})

function invalidateRequest() {
  requestVersion++
  requestController?.abort()
  loading.value = false
  observer?.disconnect()
}

function resetEvents() {
  if (requestsPaused.value || disposed) return
  invalidateRequest()
  events.value = []
  cursor.value = null
  hasMore.value = true
  error.value = null
}

async function resetEventFilters() {
  reloadEvents.cancel()
  resettingFilters.value = true
  eventFilters.resetFilters()
  await nextTick()
  resettingFilters.value = false
  await refreshEvents()
}

async function loadEvents() {
  // Central guard also covers queued observer callbacks, resets and delayed reloads.
  if (requestsPaused.value || disposed || loading.value || !hasMore.value) return

  loading.value = true
  error.value = null
  const version = requestVersion
  requestController = new AbortController()
  const signal = requestController.signal
  const firstPage = cursor.value === null
  let receivedPage = false

  try {
    const params = await build({
      includePagination: true,
      includeFilters: props.useFilters,
      filterSnapshot: editingStore.appliedFilters,
      venueUuids: props.venueUuid,
      limit: PAGE_SIZE,
      cursor: cursor.value
    })
    if (version !== requestVersion || requestsPaused.value || disposed) return
    const response = await $api<CalendarEventsResponse>(`/api/events?${params}`, { signal })
    if (version !== requestVersion || requestsPaused.value || disposed) return

    events.value.push(...response.data.events)
    receivedPage = true
    hasMore.value = response.data.events.length >= PAGE_SIZE
    cursor.value = {
      date_uuid: response.data.last_event_date_uuid,
      start_at: response.data.last_event_start_at
    }
  } catch {
    if (version === requestVersion && !disposed) error.value = 'Failed to load events'
  } finally {
    if (version === requestVersion && !disposed) {
      loading.value = false
      await nextTick()
      if (version === requestVersion && !disposed && receivedPage && firstPage && props.useFilters) {
        // Clearing the list can temporarily clamp document scroll before new cards render.
        editingStore.restoreScrollPosition(resultsElement.value)
      }
      setupObserver()
    }
  }
}

async function refreshEvents() {
  if (requestsPaused.value || disposed) return
  reloadEvents.cancel()
  resetEvents()
  await loadEvents()
}

const reloadEvents = debounce(refreshEvents, 500)

// Pause synchronously, before a pending request or observer can commit its response.
watch(requestsPaused, paused => {
  if (!paused) return
  reloadEvents.cancel()
  invalidateRequest()
}, { flush: 'sync' })

watch(
    [filterKey, eventDateSpan, requestsPaused],
    ([key, dateSpan, paused], [previousKey, previousDateSpan, wasPaused]) => {
      if (paused || resettingFilters.value) return
      if (wasPaused) {
        // One batched transition applies every draft change, including a last-keystroke close.
        void refreshEvents()
        return
      }
      if (!props.useFilters || (key === previousKey && dateSpan === previousDateSpan)) return
      const current = getSnapshot()
      const previous = JSON.parse(previousKey)
      const immediateFields = [
        'eventCategories', 'eventLocationFlag', 'eventTypeIds', 'eventGenreIds',
        'eventPriceType', 'eventPriceCurrency', 'eventMaxPrice', 'eventPortalUuid',
      ] as const
      const immediateChange = immediateFields.some(field =>
          JSON.stringify(current[field]) !== JSON.stringify(previous[field])
      ) || eventDateSpan.value !== previousDateSpan
      if (immediateChange) void refreshEvents()
      else reloadEvents()
    },
)

watch(() => props.venueUuid, () => void refreshEvents())

</script>

<style scoped lang="scss">
.kbts-events-view-layout {
  margin-top: 2rem;
  scroll-margin-top: var(--kbts-nav-height, 4rem);
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
