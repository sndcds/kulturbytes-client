<!--
  Geolist, list of states in country
-->

<template>

  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre-->

  <div
      class="kbts-geolist-layout"
  >
    <!--pre>{{ JSON.stringify(states, null, 2) }}</pre-->

    <div class="kbts-geolist-content">
      <h1>
        {{ t(`geolist.country.${countrySlug}.name`) }}
      </h1>
      <p>
        {{ t(`geolist.country.${countrySlug}.choose_state`) }}
      </p>
      <ul
          v-if="states.length"
          class="kbts-geolist-list"
      >
        <li
            v-for="state in states"
            :key="state.code"
            class="kbts-geo-link-list__item"
        >
          <NuxtLink
              :to="localePath({
                  name: 'events-country-state',
                  params: {
                      country: countrySlug,
                      state: state.slug
                  }
                })"
          >
            {{ state.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import type { GeoListState, GeoListStatesResponse } from '~/types/geolist'

defineI18nRoute({
  paths: {
    de: '/veranstaltungen/[country]',
    da: '/begivenheder/[country]',
    en: '/events/[country]'
  }
})

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const { $api } = useNuxtApp()

const countrySlug = computed(
    () =>
        route.params.country as string
)

async function fetchStates() {
  return $api<GeoListStatesResponse>(
      `/api/geolist/states/${countrySlug.value}`,
      {
        query: {
          lang: locale.value
        }
      }
  )
}

const {
  data: statesResponse
} = await useAsyncData(
    () =>
        `geo-states-${countrySlug.value}-${locale.value}`,
    fetchStates,
    {
      watch: [
        locale,
        countrySlug
      ]
    }
)

const states = computed<GeoListState[]>(() => statesResponse.value?.data ?? [])

const countryName = computed(
    () => {
      // fallback from slug
      return countrySlug.value
          .replaceAll('-', ' ')
          .replace(
              /\b\w/g,
              c => c.toUpperCase()
          )
    }
)

const headData = computed(() => ({
  title:
      `${countryName.value} – Events nach Bundesländern | kulturbytes`,
  link: [
    {
      rel: 'canonical',
      href: localePath(
          `events-${countrySlug.value}`
      )
    }
  ]
}))

useHead(() => headData.value)

const seoData = computed(() => ({
  title: `${countryName.value} – Events nach Bundesländern | kulturbytes`,
  description: `Entdecke Veranstaltungen, Konzerte und Kulturangebote in ${countryName.value}. Wähle ein Bundesland aus und finde passende Events in deiner Region.`,

  ogTitle: `${countryName.value} – Veranstaltungen entdecken`,
  ogDescription: `Finde Konzerte, Workshops und kulturelle Veranstaltungen in ${countryName.value}.`,
  ogType: 'website',

  twitterCard: 'summary_large_image',
  twitterTitle: `${countryName.value} – Events entdecken`,
  twitterDescription: `Kulturelle Veranstaltungen und Events in ${countryName.value}.`,

  robots: 'index,follow'
}))

useSeoMeta(() => seoData.value)

</script>
