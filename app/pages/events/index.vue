<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <EventsView />
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from '~/stores/filtersStore'

const filtersStore = useFiltersStore()
const { setFilter } = filtersStore
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { t } = useI18n()
const { decodeEventFilter } = useEventFilterEncoding()

setFilter('events')
applyFilterFromQuery()

defineI18nRoute({
  paths: {
    de: '/veranstaltungen',
    da: '/begivenheder',
    en: '/events'
  }
})

definePageMeta({
  filters: true
})

onUnmounted(() => {
  setFilter(null)
})

function applyFilterFromQuery() {
  const filter =
      Array.isArray(route.query.filter)
          ? route.query.filter[0]
          : route.query.filter

  if (!filter) {
    return
  }

  try {
    const decodedFilter = decodeEventFilter(filter)
    const payload = JSON.parse(decodedFilter)
    filtersStore.applyEventFilterPayload(payload)
  } catch (error) {
    console.error('Failed applying event filter from query:', error)
  }
}


/**
 * SEO
 */

const pageUrl = computed(
    () => `${config.public.siteUrl}${route.fullPath}`
)

const pageTitle = computed(
    () => `${t('events.title')}`
)

const description = computed(
   () => t('events.seo.description')
)

const headData = computed(() => ({
  title: pageTitle.value,
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
        "name": t('events.title'),
        "description": description.value,
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
            "name": t('navigation.home'),
            "item": `${config.public.siteUrl}${localePath('/')}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": t('events.title'),
            "item": pageUrl.value
          }
        ]
      })
    }
  ]
}))

const seoData = computed(() => ({
  title: pageTitle.value,
  description: description.value,

  ogTitle: pageTitle.value,
  ogDescription: description.value,
  ogImage: `${config.public.siteUrl}/images/social/events.webp`,
  ogType: 'website',
  ogUrl: pageUrl.value,

  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/events.webp`,

  robots: 'index,follow'
}))

useHead(() => headData.value)
useSeoMeta(() => seoData.value)
</script>
