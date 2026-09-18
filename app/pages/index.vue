<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->
  <div class="kbts-articles-grid">
    <div class="kbts-article kbts-article-hero">
      <div class="kbts-article-content">
        <p>
          Hallo bei <strong>kulturbytes</strong>, der neuen Plattform für
          Veranstaltungen und Orte, einem Communityprojekt des
          <a href="https://oklabflensburg.de">OK Lab Flensburg</a>.
          Schreibe uns gerne, wenn du Verbesserungsvorschläge und Ideen hast,
          oder du einen Hinweis zu Inhalten auf der Plattform mitteilen möchtest.
        </p>

        <div class="button-row">
          <NuxtLink :to="localePath('contact')" class="button">
            {{ t('goto.contact') }}
          </NuxtLink>
          <NuxtLink
              :to="localePath('about') + '#support-kulturbytes'"
              class="button"
          >
            {{ t('goto.support_us') }}
          </NuxtLink>
          <NuxtLink :to="localePath('contact')" class="button">
            {{ t('goto.for_organizers') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>

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
const { t, locale } = useI18n()
const { decodeEventFilter } = useEventFilterEncoding()
const { clearPortal } = usePortal()
import { ogLocale } from '~/utils/locale'

function activateEventsPage() {
  clearPortal()
  setFilter('events')
}

activateEventsPage()
onActivated(activateEventsPage)

applyFilterFromQuery()

definePageMeta({
  filters: 'events'
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

const pageUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)
const pageTitle = computed(() => `${t('events.title')}`)
const seoTitle = computed(() => `${t('events.seo.title')}`)
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
            "name": t('nav.home'),
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

  // twitterSite: '@kulturbytes', TODO:
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/events.webp`,

  robots: 'index,follow'
})

</script>
