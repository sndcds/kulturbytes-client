<script setup lang="ts">
import { imageUrl } from '~/utils/image'

const route = useRoute()
const { $api } = useNuxtApp()
const { locale } = useI18n()
const localePath = useLocalePath()

const PAGE_SIZE = 20

const country = computed(() =>
    String(route.params.country ?? '')
)

const region = computed(() =>
    String(route.params.region ?? '')
)

const start = new Date().toISOString().slice(0, 10)

const page = computed(() => {
  const value = Number(route.query.page ?? 1)
  return value > 0 ? value : 1
})

const offset = computed(() =>
    (page.value - 1) * PAGE_SIZE
)


/*
 * Types
 */

interface TypeSummaryResponse {
  data: {
    summary: {
      type_id: number
      count: number
    }[]
    total_event_count: number
  }
}


interface Event {
  uuid: string
  date_slug: string
  title: string
  subtitle: string
  summary: string
  image_path: string
  start_date: string
  start_time: string
  venue_name: string
  venue_city: string
}

/*
 * Fetch summary
 */

const {
  data: summaryData
} = await useAsyncData<TypeSummaryResponse>(
    () => `event-summary-${country.value}-${region.value}-${start}`,
    () =>
        $api('/api/events/type-summary', {
          query: {
            start,
            countries: "DEU"
          }
        }),
    {
      watch: [
        country,
        region
      ]
    }
)
/*
  country: country.value,
  region: region.value
 */


/*
 * Fetch events
 */

const {
  data: eventsData,
  error
} = await useAsyncData<EventsResponse>(
    () =>
        `events-${country.value}-${region.value}-${page.value}`,

    () =>
        $api('/api/events', {
          query: {
            offset: offset.value,
            limit: PAGE_SIZE
          }
        }),

    {
      watch: [
        page,
        country,
        region
      ]
    }
)

/*
  country: country.value,
  region: region.value,
 */


/*
 * Computed data
 */

const events = computed(() =>
    eventsData.value?.data.events ?? []
)


const totalEvents = computed(() =>
    summaryData.value?.data.total_event_count ?? 0
)


const totalPages = computed(() =>
    Math.ceil(totalEvents.value / PAGE_SIZE)
)


/*
 * Pagination
 */

function pageLink(pageNumber: number) {

  return localePath({
    path: `/events/${country.value}/${region.value}`,
    query:
        pageNumber > 1
            ? { page: pageNumber }
            : undefined
  })

}


/*
 * SEO
 */

useSeoMeta({

  title: () =>
      `Events in ${region.value}`,

  description: () =>
      `Upcoming concerts, workshops and events in ${region.value}.`

})

</script>


<template>
  <div class="region-events">

    <header>
      <h1>
        Events in {{ region }}
      </h1>

      <p>
        Discover upcoming events, concerts and activities
        in {{ region }}.
      </p>

      <p>
        {{ totalEvents }} upcoming events
      </p>
    </header>

    <main>
      <article
          v-for="(event, index) in events"
          :key="event.uuid"
          class="event-card"
      >
        <NuxtLink
            :to="localePath(
          `/event/${event.uuid}/${event.date_slug}`
        )"
        >
          <img
              v-if="event.image_path"
              :src="imageUrl(event.image_path, 480, '16:9')"
              :alt="event.title"
          >

          <p>
            {{ index + 1 }}
          </p>

          <h2>
            {{ event.title }}
          </h2>

          <p>
            {{ formatDate(locale, event.start_date, 'long') }}
            {{ event.start_time }}
          </p>

          <p>
            {{ event.venue_name }}
            /
            {{ event.venue_city }}
          </p>

        </NuxtLink>
      </article>
    </main>

    <nav
        v-if="totalPages > 1"
        aria-label="Event pages"
    >
      <NuxtLink
          v-if="page > 1"
          :to="pageLink(page - 1)"
      >
        Previous
      </NuxtLink>

      <span>
        Page {{ page }} of {{ totalPages }}
      </span>

      <NuxtLink
          v-if="page < totalPages"
          :to="pageLink(page + 1)"
      >
        Next
      </NuxtLink>
    </nav>

    <p v-if="error">
      Unable to load events.
    </p>

  </div>
</template>