<template>
  <EventsView v-if="portalReady" :key="`${portalIdentifier}:${portalUuid}`" />
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import { ogLocale } from '~/utils/locale'

defineI18nRoute({
  paths: {
    de: '/portal/[portal_identifier]/events',
    da: '/portal/[portal_identifier]/events',
    en: '/portal/[portal_identifier]/events'
  }
})

definePageMeta({
  filters: true
})

const filtersStore = useFiltersStore()
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { t, locale } = useI18n()
const { decodeEventFilter } = useEventFilterEncoding()
const { activatePortal } = usePortal()
const portalReady = ref(false)

const portalIdentifier = computed(() => {
  const value = route.params.portal_identifier
  return Array.isArray(value) ? value[0] ?? '' : value?.toString() ?? ''
})
const portalUuid = computed(() => filtersStore.eventPortalUuid)

async function activateEventsPortal() {
  portalReady.value = false
  await activatePortal(portalIdentifier.value)
  filtersStore.setFilter('events')
  portalReady.value = Boolean(filtersStore.eventPortalUuid)
}

await activateEventsPortal()
onActivated(activateEventsPortal)
watch(portalIdentifier, activateEventsPortal)
applyFilterFromQuery()

onUnmounted(() => {
  filtersStore.setFilter(null)
})

function applyFilterFromQuery() {
  const filter = Array.isArray(route.query.filter)
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

const pageUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)
const pageTitle = computed(() => t('events.title'))
const seoTitle = computed(() => t('events.seo.title'))
const description = computed(() => t('events.seo.description'))

const headData = computed(() => ({
  title: pageTitle.value,
  htmlAttrs: {
    lang: locale.value
  },
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: pageUrl.value
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: t('events.title'),
        description: description.value,
        url: pageUrl.value
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('nav.home'),
            item: `${config.public.siteUrl}${localePath('/')}`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t('events.title'),
            item: pageUrl.value
          }
        ]
      })
    }
  ]
}))

useHead(() => headData.value)

useSeoMeta({
  title: pageTitle.value,
  description: description.value,

  ogType: 'website',
  ogSiteName: t('siteName'),
  ogLocale: ogLocale(locale.value),
  ogTitle: seoTitle.value,
  ogDescription: description.value,
  ogUrl: pageUrl.value,
  ogImage: `${config.public.siteUrl}/images/social/events.webp`,
  ogImageWidth: '1200',
  ogImageHeight: '675',
  ogImageAlt: t('events.seo.image_alt'),

  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/events.webp`,

  robots: 'index,follow'
})
</script>
