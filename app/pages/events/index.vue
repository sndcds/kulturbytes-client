<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <div>
    <button
        type="button"
        class="kbts-events-save-filter"
        @click="saveFilter"
    >
      Save Filter
    </button>

    <EventsView />
  </div>
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from '~/stores/filtersStore'

const BASE62_ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const filtersStore = useFiltersStore()
const { setFilter } = filtersStore
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { t } = useI18n()

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

function encodeBase62(value: string) {
  const bytes = new TextEncoder().encode(value)
  let number = 0n

  for (const byte of bytes) {
    number = (number << 8n) + BigInt(byte)
  }

  if (number === 0n) {
    return BASE62_ALPHABET[0]
  }

  let encoded = ''
  const base = BigInt(BASE62_ALPHABET.length)

  while (number > 0n) {
    const remainder = Number(number % base)
    encoded = BASE62_ALPHABET[remainder] + encoded
    number = number / base
  }

  return encoded
}

function decodeBase62(value: string) {
  let number = 0n
  const base = BigInt(BASE62_ALPHABET.length)

  for (const character of value) {
    const index = BASE62_ALPHABET.indexOf(character)

    if (index === -1) {
      throw new Error('Invalid base62 filter value')
    }

    number = number * base + BigInt(index)
  }

  if (number === 0n) {
    return ''
  }

  const bytes: number[] = []

  while (number > 0n) {
    bytes.unshift(Number(number & 255n))
    number = number >> 8n
  }

  return new TextDecoder().decode(new Uint8Array(bytes))
}

function applyFilterFromQuery() {
  const filter =
      Array.isArray(route.query.filter)
          ? route.query.filter[0]
          : route.query.filter

  if (!filter) {
    return
  }

  try {
    const decodedFilter = decodeBase62(filter)
    const payload = JSON.parse(decodedFilter)
    filtersStore.applyEventFilterPayload(payload)
  } catch (error) {
    console.error('Failed applying event filter from query:', error)
  }
}

async function saveFilter() {
  const payload = filtersStore.buildEventFilterPayload()
  const encodedFilter = encodeBase62(JSON.stringify(payload))

  await router.push({
    path: localePath('events'),
    query: {
      ...route.query,
      filter: encodedFilter,
    },
  })
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

<style scoped>
.kbts-events-save-filter {
  margin: 1rem;
}
</style>
