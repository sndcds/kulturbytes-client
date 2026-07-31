<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <VenueMap class="venues-map" />
</template>


<script setup lang="ts">
import VenueMap from '~/components/venue/VenueMap.client.vue'

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

const route = useRoute()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { t } = useI18n()

const pageUrl = computed(
    () => `${config.public.siteUrl}${route.fullPath}`
)

const pageTitle = computed(
    () => `${t('venues.title')}`
)

const description = computed(
    () => t('venues.seo.description')
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

const seoData = computed(() => ({
  title: pageTitle.value,
  description: description.value,

  ogTitle: pageTitle.value,
  ogDescription: description.value,
  ogImage: `${config.public.siteUrl}/images/social/venues.webp`,
  ogType: 'website',
  ogUrl: pageUrl.value,

  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/venues.webp`,

  robots: 'index,follow'
}))

useHead(() => headData.value)
useSeoMeta(() => seoData.value)

</script>


<style scoped>
.venues-map {
  width: 100%;
  height: 100%;
}
</style>