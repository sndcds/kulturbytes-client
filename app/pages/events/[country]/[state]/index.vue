<template>
  <div class="kbts-events-geo-layout">

    regions: {{ JSON.stringify(regionsResponse, null, 2) }}<br>
    route: {{ route.params }}<br>


    <div class="kbts-events-geo-content">

      <h1 class="kbts-events-geo-title">
        {{ stateName }}
      </h1>

      <p class="kbts-events-geo-description">
        {{ t('events.choose_region') }}
      </p>

      <ul
          v-if="regions.length"
          class="kbts-geo-link-list"
      >
        <li
            v-for="region in regions"
            :key="region.code"
            class="kbts-geo-link-list__item"
        >
          <NuxtLink
              :to="localePath(
                `/events/${countrySlug}/${stateSlug}/${region.slug}`
              )"
              class="kbts-geo-link-list__link"
          >
            {{ region.name }}
          </NuxtLink>
        </li>
      </ul>

      <p
          v-else
          class="kbts-events-empty"
      >
        {{ t('events.none_found') }}
      </p>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface GeoRegion {
  code: string
  country_code: string
  state_code: string
  name: string
  slug: string
}

interface GeoRegionsResponse {
  data: GeoRegion[]
}

const route = useRoute()

const { locale, t } = useI18n()
const localePath = useLocalePath()
const { $api } = useNuxtApp()

const countrySlug = computed(
    () => String(route.params.country ?? '')
)

const stateSlug = computed(
    () => String(route.params.state ?? '')
)

async function fetchRegions() {
  return $api<GeoRegionsResponse>(
      `/api/geo/countries/${countrySlug.value}/states/${stateSlug.value}`,
      {
        query: {
          lang: locale.value
        }
      }
  )
}

const {
  data: regionsResponse
} = await useAsyncData(
    () =>
        `geo-regions-${countrySlug.value}-${stateSlug.value}-${locale.value}`,
    fetchRegions,
    {
      watch: [
        locale,
        countrySlug,
        stateSlug
      ]
    }
)

const regions = computed(
    () => regionsResponse.value?.data ?? []
)

const stateName = computed(() => {
  return stateSlug.value
      .replaceAll('-', ' ')
      .replace(
          /\b\w/g,
          c => c.toUpperCase()
      )
})

useHead(() => ({
  title: `${stateName.value} - ${t('events.title')}`,

  meta: [
    {
      name: 'description',
      content: `${t('events.choose_region')} ${stateName.value}`
    }
  ]
}))
</script>

<style lang="scss">

.kbts-events-geo-layout {
  min-width: 0;
  max-width: 100%;
}

.kbts-events-geo-content {
  max-width: 900px;
}

.kbts-events-geo-title {
  font-size: 3rem;
  font-weight: 300;
  margin: 0 0 1rem;
}

.kbts-events-geo-description {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.kbts-geo-link-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.kbts-geo-link-list__link {
  display: block;

  padding: .75rem 1rem;

  border-radius: 8px;

  border: 1px solid var(--kbts-border);
  background: var(--kbts-surface);

  text-decoration: none;

  transition: transform .2s ease;

  &:hover {
    transform: translateX(.25rem);
  }
}

.kbts-events-empty {
  opacity: .7;
}

</style>