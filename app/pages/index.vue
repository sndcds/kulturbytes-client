<template>

  <CTABanner
      :title="t('home.intro.title')"
      image-url="images/kulturbytes-logo-typo-2-lines-white-red.svg"
      image-max-width="400px"
      image-align="left"
      image-vertical-align="bottom"
      background-image="/images/bg/kbts-bg-2026-09.svg"
      mobile-background-image="/images/bg/kbts-bg-2026-09.svg"
      :links="[
    {
      label: t('home.intro.contact'),
      to: localePath('contact')
    },
    {
      label: t('home.intro.support'),
      to: {
        path: localePath('about'),
        hash: '#support-kulturbytes'
      }
    },
    {
      label: t('home.intro.organize'),
      to: {
        path: localePath('about'),
        hash: '#for-organizers'
      }
    }
  ]"
      background-color="#334"
      title-color="#eee"
      text-color="#eee"
      cta-color="#eee"
  >
    <template #description>
      <i18n-t keypath="home.intro.description">
        <template #link>
          <a
              href="https://oklabflensburg.de"
              target="_blank"
              rel="noopener noreferrer"
          >
            OK Lab Flensburg
            <ExternalLink
                class="external-link-icon"
                :size="16"
                :stroke-width="1.75"
                aria-hidden="true"
            />
          </a>
        </template>
      </i18n-t>
    </template>
  </CTABanner>

  <EventsView />

</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import CTABanner from '~/components/ui/CTABanner.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import { ogLocale } from '~/utils/locale'
import { ExternalLink } from '@lucide/vue'

const filtersStore = useFiltersStore()
const { setFilter } = filtersStore
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { t, locale } = useI18n()
const { decodeEventFilter } = useEventFilterEncoding()
const { clearPortal } = usePortal()

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
