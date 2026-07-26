<!--
  Geolist, list of regions in state
-->

<template>

  <pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre>

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
import type { GeoListRegion, GeoListRegionsResponse } from '~/types/geolist'


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

const headData = computed(() => ({
  title: `${stateName.value ?? ''} – Events nach Regionen | kulturbytes`,
  link: [
    {
      rel: 'canonical',
      href: localePath(
          `/eventlist/${countrySlug.value}/${stateSlug.value}`
      )
    }
  ]
}))

useHead(() => headData.value)

const seoData = computed(() => ({
  title: `${stateName.value ?? ''} – Events nach Regionen | kulturbytes`,

  description: `Entdecke Veranstaltungen, Konzerte und kulturelle Events in ${stateName.value ?? ''}. Wähle eine Region aus, um passende Veranstaltungen zu finden.`,

  ogTitle: `${stateName.value ?? ''} – Events nach Regionen`,
  ogDescription: `Finde Veranstaltungen und Kulturangebote in den Regionen von ${stateName.value ?? ''}.`,
  ogType: 'website',

  twitterCard: 'summary_large_image',
  twitterTitle: `${stateName.value ?? ''} – Events nach Regionen`,
  twitterDescription: `Kulturelle Veranstaltungen in ${stateName.value ?? ''}.`,

  robots: 'index,follow'
}))

useSeoMeta(() => seoData.value)

</script>
