<!--
  Geolist, list of regions in state
-->

<template>
  <div class="kbts-geolist-layout">
    <!--pre>{{ JSON.stringify(regionsResponse, null, 2) }}</pre-->

    <div class="kbts-geolist-content">
      <h1>
        {{ stateName }}
      </h1>
      <p>
        {{ t('geolist.choose_region') }}
      </p>
      <ul
          v-if="regions.length"
          class="kbts-geolist-list"
      >
        <li
            v-for="region in regions"
            :key="region.code"
        >
          <NuxtLink
              :to="localePath(
                `/eventlist/${countrySlug}/${stateSlug}/${region.slug}`
              )"
          >
            {{ region.name }}
          </NuxtLink>
        </li>
      </ul>
      <p
          v-else
          class="kbts-events-empty"
      >
        {{ t('event.no_events_found') }}
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import type { GeoListRegion, GeoListRegionResponse } from '~/types/geo'


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
  return $api<GeoListRegionsResponse>(
      `/api/geolist/regions/${countrySlug.value}/${stateSlug.value}`,
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
  return regionsResponse.value?.metadata?.state_name
})

// TODO:
useHead(() => ({
  title: t('geolist.regions_title'),
  meta: [
    {
      name: 'description',
      content: `${t('geolist.choose_region')} ${stateName.value}`
    }
  ]
}))

</script>
