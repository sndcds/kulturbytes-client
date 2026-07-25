<!--
  Geolist, region
-->

<template>
  <div class="kbts-region-event-view">

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


<script setup lang="ts">
import { imageUrl } from '~/utils/image'
import type { GeoListRegion, GeoListRegionResponse } from '~/types/geo'

const route = useRoute()
const { $api } = useNuxtApp()
const { locale } = useI18n()
const localePath = useLocalePath()

const PAGE_SIZE = 20

const regionName = computed(() => regionData.value.data?.region?.name)
const start = new Date().toISOString().slice(0, 10)

const page = computed(() => {
  const value = Number(route.query.page ?? 1)
  return value > 0 ? value : 1
})

const offset = computed(() =>
    (page.value - 1) * PAGE_SIZE
)

const countrySlug = computed(() => route.params.country as string)
const stateSlug = computed(() => route.params.state as string)
const regionSlug = computed(() => route.params.region as string)

async function fetchRegion() {
  return $api(`/api/geolist/region/${countrySlug.value}/${stateSlug.value}/${regionSlug.value}`)
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
    () => `event-summary-${countrySlug.value}-${stateSlug.value}-${regionSlug.value}-${start}`,
    () =>
        $api('/api/events/type-summary', {
          query: {
            start,
            geolist_region: `${countrySlug.value},${stateSlug.value},${regionSlug.value}`,
          }
        }),
    {
      watch: [countrySlug, stateSlug, regionName]
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
        `events-${countrySlug.value}-${stateSlug.value}-${regionSlug.value}-${page.value}`,
    () =>
        $api('/api/events', {
          query: {
            geolist_region: `${countrySlug.value},${stateSlug.value},${regionSlug.value}`,
            offset: offset.value,
            limit: PAGE_SIZE
          }
        }),
    {
      watch: [page, countrySlug, stateSlug, regionSlug]
    }
)

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
    path: `/eventlist/${countrySlug.value}/${stateSlug.value}/${regionSlug.value}`,
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
      `Events in ${regionName.value}`,

  description: () =>
      `Upcoming concerts, workshops and events in ${regionName.value}.`

})

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

  background: var(--kbts-accent-color);
  color: white;
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