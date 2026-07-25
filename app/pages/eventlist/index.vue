<!--
  Geolist, list of countries
-->

<template>
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
              :to="localePath(`/eventlist/${country.slug}`)"
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
} from '~/types/geo'


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

useHead(() => {
  const head = {
    title: t('geolist.countries_title'),
    meta: [
      {
        name: 'description',
        content: t('geolist.countries_description')
      },
      {
        property: 'og:title',
        content: t('geolist.countries_title')
      },
      {
        property: 'og:description',
        content: t('geolist.countries_description')
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:url',
        content: pageUrl.value
      }
    ],
    link: [
      {
        rel: 'canonical',
        href:
        pageUrl.value
      }
    ],
    script: [
      /**
       * Collection page schema
       */
      {
        type: 'application/ld+json',
        children:
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": t('geolist.countries_title'),
              "description": t('geolist.countries_description'),
              "url": pageUrl.value
            })
      },
      /**
       * Breadcrumb schema
       */
      {
        type: 'application/ld+json',
        children:
            JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": t('events.title'),
                  "item": `${config.public.siteUrl}${localePath('/events')}`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": t('geolist.countries_title'),
                  "item":
                  pageUrl.value
                }
              ]
            })
      }
    ]
  }
  console.log('useHead:', JSON.stringify(head, null, 2))
  return head
})

</script>