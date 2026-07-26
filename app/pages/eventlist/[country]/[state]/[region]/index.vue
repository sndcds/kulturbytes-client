<!--
  Geolist, region
-->

<template>
  <div class="kbts-region-event-view">

    <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre>
    <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre-->


    <header>
      <h1>
        Events in {{ regionName }}
      </h1>

      <p>
        Discover upcoming events, concerts and activities in {{ regionName }}.
      </p>

      <p>
        {{ totalEvents }} upcoming events
      </p>
    </header>

    <main>
      <article
          v-for="event in events"
          :key="event.uuid"
          class="event-card"
      >
        <img
            v-if="event.image_path"
            :src="imageUrl(event.image_path, 240, '16:9')"
            :alt="event.title"
            class="event-card__image"
        >

        <div class="event-card__content">

          <h2 class="event-card__title">
            {{ event.title }}
          </h2>

          <p
              v-if="event.subtitle"
              class="event-card__subtitle"
          >
            {{ event.subtitle }}
          </p>

          <p class="event-card__date">
            {{ formatDate(locale, event.start_date, 'long') }}
            ·
            {{ event.start_time }}
          </p>

          <p class="event-card__venue">
            {{ event.venue_name }}
            <span v-if="event.venue_city">
        · {{ event.venue_city }}
      </span>
          </p>

          <p
              v-if="event.summary"
              class="event-card__summary"
          >
            {{ event.summary }}
          </p>

        </div>

        <div class="event-card__actions">

          <NuxtLink
              :to="localePath(`/event/${event.uuid}/${event.date_slug}`)"
              class="event-card__button"
          >
            Details
          </NuxtLink>

        </div>
      </article>
    </main>

    <nav
        v-if="page > 1 || hasNextPage"
        aria-label="Event pages"
        class="event-list__pagination"
    >
      <NuxtLink
          v-if="page > 1"
          :to="firstPageLink"
      >
        First page
      </NuxtLink>

      <span>
        Page {{ page }}
      </span>

      <NuxtLink
          v-if="hasNextPage"
          :to="nextPageLink"
          rel="next"
      >
        Next
      </NuxtLink>
    </nav>

    <p v-if="pending">
      Loading events...
    </p>

    <p v-if="error">
      Unable to load events.
    </p>

  </div>
</template>


<script setup lang="ts">
import { imageUrl } from '~/utils/image'
import type { CalendarEventsResponse } from '~/types/calendarEvent'
import type { GeoListRegionResponse } from '~/types/geolist'

const route = useRoute()
const { $api } = useNuxtApp()
const { locale } = useI18n()
const localePath = useLocalePath()

const PAGE_SIZE = 20

const start = new Date().toISOString().slice(0, 10)

interface TypeSummaryResponse {
  data: {
    summary: {
      type_id: number
      count: number
    }[]
    total_event_count: number
  }
}

const countrySlug = computed(() => route.params.country as string)
const stateSlug = computed(() => route.params.state as string)
const regionSlug = computed(() => route.params.region as string)
const geolistRegion = computed(() =>
    `${countrySlug.value},${stateSlug.value},${regionSlug.value}`
)

function stringQueryParam(name: string) {
  const value = route.query[name]

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ? String(value) : ''
}

const currentCursor = computed(() => {
  const dateUuid = stringQueryParam('last_event_date_uuid')
  const startAt = stringQueryParam('last_event_start_at')

  if (!dateUuid || !startAt) {
    return null
  }

  return {
    date_uuid: dateUuid,
    start_at: startAt
  }
})

const page = computed(() => {
  const value = Number(route.query.page ?? 1)

  if (!currentCursor.value) {
    return 1
  }

  return value > 0 ? value : 1
})

async function fetchRegion(): Promise<GeoListRegionResponse> {
  return $api<GeoListRegionResponse>(
      `/api/geolist/region/${countrySlug.value}/${stateSlug.value}/${regionSlug.value}`
  )
}

const { data: regionData } = await useAsyncData<GeoListRegionResponse>(
    () =>
        `geo-region-${countrySlug.value}-${stateSlug.value}-${regionSlug.value}`,
    fetchRegion,
    {
      watch: [
        countrySlug,
        stateSlug,
        regionSlug
      ]
    }
)

const regionName = computed(() =>
    regionData.value?.data?.region?.name
)

/*
 * Fetch summary
 */

const {
  data: summaryData
} = await useAsyncData<TypeSummaryResponse>(
    () => `event-summary-${countrySlug.value}-${stateSlug.value}-${regionSlug.value}-${start}`,
    () =>
        $api('/api/events/type-summary', {
          query: {
            start,
            geolist_region: geolistRegion.value,
          }
        }),
    {
      watch: [countrySlug, stateSlug, regionSlug]
    }
)

/*
 * Fetch events
 */

const {
  data: eventsData,
  error,
  pending
} = await useAsyncData<CalendarEventsResponse>(
    () =>
        [
          'events',
          countrySlug.value,
          stateSlug.value,
          regionSlug.value,
          currentCursor.value?.date_uuid ?? 'start',
          currentCursor.value?.start_at ?? 'start'
        ].join('-'),
    () =>
        $api<CalendarEventsResponse>(
            '/api/events',
            {
              query: {
                geolist_region: geolistRegion.value,
                limit: PAGE_SIZE,
                ...(currentCursor.value
                    ? {
                      last_event_date_uuid: currentCursor.value.date_uuid,
                      last_event_start_at: currentCursor.value.start_at
                    }
                    : {})
              }
            }
        ),
    {
      watch: [
        countrySlug,
        stateSlug,
        regionSlug,
        currentCursor
      ]
    }
)

const events = computed(() =>
    eventsData.value?.data.events ?? []
)

const nextCursor = computed(() => {
  const data = eventsData.value?.data

  if (!data?.last_event_date_uuid || !data.last_event_start_at) {
    return null
  }

  return {
    date_uuid: data.last_event_date_uuid,
    start_at: data.last_event_start_at
  }
})

const hasNextPage = computed(() =>
    events.value.length === PAGE_SIZE && !!nextCursor.value
)

const firstPageLink = computed(() =>
    localePath({
      path: `/eventlist/${countrySlug.value}/${stateSlug.value}/${regionSlug.value}`
    })
)

const nextPageLink = computed(() => {
  if (!nextCursor.value) {
    return firstPageLink.value
  }

  return localePath({
    path: `/eventlist/${countrySlug.value}/${stateSlug.value}/${regionSlug.value}`,
    query: {
      page: page.value + 1,
      last_event_date_uuid: nextCursor.value.date_uuid,
      last_event_start_at: nextCursor.value.start_at
    }
  })
})

const totalEvents = computed(() =>
    summaryData.value?.data.total_event_count ?? 0
)

const headData = computed(() => ({
  link: [
    ...(hasNextPage.value
        ? [
          {
            rel: 'next',
            href: nextPageLink.value
          }
        ]
        : [])
  ]
}))

console.log('useHead data:', headData.value)
console.log(JSON.stringify(headData.value, null, 2))

useHead(() => headData.value)


const seoData = computed(() => ({
  title: `Events in ${regionName.value}`,
  description: `Upcoming concerts, workshops and events in ${regionName.value}.`,

  ogTitle: `Events in ${regionName.value}`,
  ogDescription: `Discover upcoming events in ${regionName.value}.`,
  ogType: 'website',

  twitterCard: 'summary_large_image',
  twitterTitle: `Events in ${regionName.value}`,
  twitterDescription: `Discover upcoming events in ${regionName.value}.`,

  robots: 'index,follow'
}))

console.log('useSeoMeta data:', seoData.value)
console.log(JSON.stringify(seoData.value, null, 2))

useSeoMeta(seoData.value)

</script>


<style lang="scss">

.kbts-region-event-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;

  header, h1, h2 {
    font-weight: 300;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  img {
    border-radius: .25rem;
    width: 240px;
  }
}

.event-card {
  display: grid;
  grid-template-columns: 240px 1fr 120px;
  gap: 1rem;

  padding: 1rem;

  background: var(--kbts-card-bg);
  border: 1px solid var(--kbts-border-color);
  border-radius: .5rem;

  transition:
      box-shadow .15s ease,
      transform .15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 .25rem .75rem rgba(0,0,0,.08);
  }
}

.event-card__image {
  width: 240px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: .35rem;
}

.event-card__content {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  min-width: 0;
}

.event-card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 500;
}

.event-card__subtitle {
  margin: 0;
  opacity: .8;
}

.event-card__date,
.event-card__venue {
  margin: 0;
  font-size: .95rem;
}

.event-card__summary {
  margin: 0;
  color: var(--kbts-text-secondary);
  line-height: 1.45;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card__actions {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.event-card__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: .65rem 1rem;

  border-radius: .35rem;

  color: var(--kbts-fg);
  text-decoration: none;
  white-space: nowrap;

  transition: opacity .15s ease;

  &:hover {
    opacity: .9;
  }
}

@media (max-width: 800px) {

  .event-card {
    grid-template-columns: 1fr;
  }

  .event-card__image {
    width: 100%;
  }

  .event-card__actions {
    justify-content: flex-start;
  }

}

</style>
