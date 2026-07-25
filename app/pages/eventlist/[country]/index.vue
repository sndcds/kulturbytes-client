<!--
  Geolist, list of states in country
-->

<template>
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
              :to="localePath(
                `/eventlist/${countrySlug}/${state.slug}`
              )"
              class="kbts-geo-link-list__link"
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
import type { GeoListState, GeoListStatesResponse } from '~/types/geo'


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

// TODO:
useHead(() => ({
  title: t('geolist.states_title'),
  meta: [
    {
      name: 'description',
      content:
          `${t('events.title')} ${countryName.value}`
    }
  ]
}))

</script>
