<template>
  <div class="kbts-events-view-layout">

    <!--pre v-if="apiResponse">{{ apiResponse.data.last_event_date_uuid }}</pre>
    <pre v-if="apiResponse">{{ apiResponse.data.last_event_start_at }}</pre-->

    <h1>{{ summaryStore.totalEventCount }} {{ $t('home.title') }}</h1>

    <div
        class="kbts-events-view-grid"
    >
      <NuxtLink
          v-for="event in events"
          :key="event.uuid"
          :to="`/event/${event.uuid}/${event.date_slug}`"
          class="kbts-events-view-card"
      >
        <div class="kbts-events-view-grid-image">
          <div class="kbts-events-view-image-clip">
            <div
                class="kbts-events-view-image"
                :class="{ 'has-placeholder': !event.image_path }"
                :style="event.image_path ? {
                  backgroundImage: `url(${imageUrl(event.image_path, 480, '16:9')})`
                } : {}"
            >
              <Heart
                  v-if="!event.image_path"
                  class="x_image_icon"
                  :size="64"
                  :stroke-width="1"
              />
            </div>
          </div>
          <EventPriceBadge
              v-if="event.price_type && ['free', 'donation'].includes(event.price_type)"
              :price-type="event.price_type"
              class="kbts-event-price-badge"
              :size="26"
          />
        </div>

        <div class="kbts-events-view-card-content">
          <h2>{{ event.title }}</h2>
          {{ formatDate(locale, event.start_date, 'weekday') }} / {{ event.start_time }}<br>
          {{ event.venue_name }} / {{ event.venue_city }}<br>
        </div>
      </NuxtLink>

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
import { imageUrl } from '~/utils/image'
import { Heart } from '@lucide/vue'
import { useFiltersStore } from '~/stores/filtersStore'

const PAGE_SIZE = 20
const { locale } = useI18n()
const { $api } = useNuxtApp()

const eventFilters = useFiltersStore()

const {
  eventCategories,
  eventDateSpan,
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
} = storeToRefs(eventFilters)

const events = ref<Event[]>([])
const summaryStore = useEventSummaryStore()
const {
  build,
  watchedFilters
} = useEventQueryParams()

const loading = ref(false)
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

onMounted(async () => {
  await loadEvents()
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})


interface Event {
  uuid: string
  date_uuid: string
  date_slug: string
  image_path: string
  title: string
  subtitle: string
  summary: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  all_day: boolean
  space_uuid: string
  space_name: string
  venue_uuid: string
  venue_name: string
  venue_city: string
  price_type: string
}

function resetEvents() {
  events.value = []
  cursor.value = null
  hasMore.value = true
}

async function loadEvents() {
  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    const params = await build({
      includePagination: true,
      limit: PAGE_SIZE,
      cursor: cursor.value
    })

    const url = `/api/events?${params}`
    const response = await $api<EventsResponse>(url)

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

watch(
    watchedFilters,
    async () => {
      resetEvents()
      await loadEvents()
    },
    {
      deep: true
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

.kbts-events-view-card {
  display: block;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  background: var(--kbts-card-bg);
  max-width: 600px;

  color: inherit;
  text-decoration: none;

  &:visited {
    color: inherit;
  }

  &:hover {
    color: inherit;
    text-decoration: none;
  }
}

.kbts-events-view-grid-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: visible;

  .kbts-events-view-image-clip {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .kbts-events-view-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform 0.2s ease;

      display: flex;
      align-items: center;
      justify-content: center;

      &.has-placeholder {
        background: palegreen;
        color: white;
      }

      &:hover {
        transform: scale(1.06);
      }
    }
  }
}

.kbts-events-view-card-content {
  padding: 0.5rem 1rem;
  font-weight: 300;
  font-size: 0.9rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0.5rem 0;
  }
}

.kbts-events-view-load-trigger {
  height: 40px;
  margin-top: 20px;
}
</style>