<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <VenueMap class="venues-map" />
</template>


<script setup lang="ts">
import VenueMap from '~/components/venue/VenueMap.client.vue'
import { ogLocale } from '~/utils/locale'

const route = useRoute()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { t } = useI18n()


defineI18nRoute({
  paths: {
    de: '/orte/karte',
    da: '/steder/kort',
    en: '/venues/map'
  }
})

definePageMeta({
  layout: 'map'
})

/**
 * SEO
 */

const pageUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)
const pageTitle = computed(() => `${t('venues.title')}`)
const description = computed(() => t('venues.seo.description'))

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
        "name": t('venues.title'),
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
            "name": t('venues.title'),
            "item": pageUrl.value
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
  ogTitle: pageTitle.value,
  ogDescription: description.value,
  ogUrl: pageUrl.value,
  ogImage: `${config.public.siteUrl}/images/social/events.webp`,
  ogImageWidth: '1200',
  ogImageHeight: '675',
  ogImageAlt: t('events.seo.image_alt'),

  // twitterSite: '@kulturbytes', TODO:
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/events.webp`,

  robots: 'index,follow'
})

</script>


<style scoped>
.venues-map {
  width: 100%;
  height: 100%;
}
</style>