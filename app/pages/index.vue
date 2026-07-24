<!--
  Geolist, list of countries
-->

<template>
  <div
      class="kbts-geolist-layout"
  >

    <!--pre>{{ JSON.stringify(countriesResponse, null, 2) }}</pre-->

    <div class="kbts-geolist-content">

      <h1>
        {{ t('geo.list_by_countries') }}
      </h1>

      <p>
        {{ t('geo.countries_description') }}
      </p>

      <h2>
        {{ t('geo.choose_country') }}
      </h2>

      <ul class="kbts-geolist-list">
        <li
            v-for="country in countries"
            :key="country.code"
            class="kbts-geolist-list__item"
        >
          <NuxtLink
              :to="localePath(
                `/events/${country.slug}`
              )"
              class="kbts-geolist-list__link"
          >
            {{ t(`geo.country.${country.slug}.name`) }}
          </NuxtLink>
        </li>
      </ul>

    </div>
  </div>
</template>


<script setup lang="ts">
import type { GeoListCountry, GeoListCountriesResponse } from '~/types/geo'

const { locale, t } = useI18n()
const localePath = useLocalePath()

const { $api } = useNuxtApp()

async function fetchCountries() {
  return $api<GeoListCountriesResponse>(
      '/api/geo/countries',
      {
        query: {
          lang: locale.value
        }
      }
  )
}

const {
  data: countriesResponse
} = await useAsyncData(
    () =>
        `geo-countries-${locale.value}`,
    fetchCountries,
    {
      watch: [
        locale
      ]
    }
)

const countries = computed<GeoListCountry[]>(() => countriesResponse.value?.data ?? [])

useHead(() => ({
  title: t('events.title'),
  meta: [
    {
      name: 'description',
      content: t('events.description')
    }
  ]
}))

</script>
