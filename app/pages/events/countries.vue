<!--
  Geolist, list of countries
-->

<template>

  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre-->

  <div class="kbts-geolist-layout">
    <div class="kbts-geolist-content">
      <h1>
        {{ t('geolist.list_by_countries') }}
      </h1>
      <p>
        {{ t('geolist.countries_description') }}
      </p>
      <h2>
        {{ t('geolist.choose_country') }}
      </h2>
      <ul class="kbts-geolist-list">
        <li
            v-for="country in countries"
            :key="country.code"
            class="kbts-geolist-list__item"
        >
          <NuxtLink
              :to="localePath({
                  name: 'events-country',
                  params: {
                      country: country.slug
                  }
              })"
              class="kbts-geolist-list__link"
          >
            {{ t(`geolist.country.${country.slug}.name`) }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup lang="ts">
import type {
  GeoListCountry,
  GeoListCountriesResponse
} from '~/types/geolist'

defineI18nRoute({
  paths: {
    de: '/veranstaltungen/laender',
    da: '/begivenheder/lande',
    en: '/events/countries',
  }
})

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()

/**
 * Load countries
 */
async function fetchCountries() {
  return $api<GeoListCountriesResponse>(
      '/api/geolist/countries',
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

const countries = computed<GeoListCountry[]>(
    () =>
        countriesResponse.value?.data ?? []
)

/**
 * SEO
 */
const pageUrl = computed(
    () =>
        `${config.public.siteUrl}${route.fullPath}`
)

const headData = computed(() => ({
  link: [
    {
      rel: 'canonical',
      href: pageUrl.value
    }
  ],

  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": t('geolist.countries_title'),
        "description": t('geolist.countries_description'),
        "url": pageUrl.value
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": t('geolist.list_by_countries'),
            "item": `${config.public.siteUrl}${localePath('/')}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": t('geolist.countries_title'),
            "item": pageUrl.value
          }
        ]
      })
    }
  ]
}))

useHead(() => headData.value)

const seoData = computed(() => ({
  title: t('geolist.countries_title'),
  description: t('geolist.countries_description'),

  ogTitle: t('geolist.countries_title'),
  ogDescription: t('geolist.countries_description'),
  ogType: 'website',
  ogUrl: pageUrl.value,

  twitterCard: 'summary_large_image',
  twitterTitle: t('geolist.countries_title'),
  twitterDescription: t('geolist.countries_description'),

  robots: 'index,follow'
}))

useSeoMeta(() => seoData.value)

</script>