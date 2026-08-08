<template>
  <div
      v-if="venue"
      class="kbts-venue-view-layout"
  >

    <!-- Left Column -->
    <div class="kbts-venue-view-column kbts-venue-view-column-left">

      <!-- Image -->
      <div
          v-if="venueImage"
          class="kbts-venue-view-image"
      >
        <div class="kbts-venue-view-image-outer">
          <div
              class="kbts-venue-view-image-inner"
              :style="{
          backgroundImage: `url(${imageUrl(venueImage.url, 960, '16:9')})`
        }"
          />
        </div>

        <span
            v-if="imageCredit"
            class="kbts-venue-view-image-caption"
        >
          {{ imageCredit }}
        </span>
      </div>

      <!-- Content -->
      <div class="kbts-venue-view-content">
        <h1 class="kbts-venue-view-title">
          {{ venue.name }}
        </h1>

        <div
            class="kbts-venue-description"
            v-html="descriptionHtml"
        />
      </div>

    </div>


    <!-- Right Column -->
    <div class="kbts-venue-view-column kbts-venue-view-column-right">

      <!-- Logo -->
      <LogoImage
          v-if="venueLogos"
          class="kbts-venue-view-logo"
          :main-src="venueLogos.main_logo?.url"
          :light-src="venueLogos.light_theme_logo?.url"
          :dark-src="venueLogos.dark_theme_logo?.url"
          :theme="themeStore.theme"
          :link-url="venue.web_link"
          :pixel-count="240 * 120"
          :max-width="240"
          :max-height="200"
          link-target="_blank"
      />

      <!-- Address -->
      <div
          class="kbts-venue-view-venue kbts-venue-view-address kbts-flex-col"
      >
        <span class="kbts-venue-view-label">
          {{ t('address') }}
        </span>

        <span>{{ venue.name }}</span>

        <span v-if="venue.street || venue.house_number">
          {{ [venue.street, venue.house_number].filter(Boolean).join(' ') }}
        </span>

        <span v-if="venue.postal_code || venue.city">
          {{ [venue.postal_code, venue.city].filter(Boolean).join(' ') }}
        </span>
      </div>

      <!-- Organization -->
      <div
          v-if="venue.organization"
          class="kbts-venue-view-venue kbts-venue-view-organization kbts-flex-col"
      >
        <span class="kbts-venue-view-label">
          {{ t('organization') }}
        </span>

        <a
            v-if="venue.organization.web_link"
            :href="venue.organization.web_link"
            target="_blank"
        >
          {{ venue.organization.name }} ↗
        </a>

        <span v-else>
          {{ venue.organization.name }}
        </span>
      </div>

      <!-- Share -->
      <div class="kbts-venue-view-share">
        <FacebookShareButton
            :quote="venue.name"
            hashtag="#kulturbytes"
        />
      </div>

      <!-- Map -->
      <SinglePointMap
          v-if="Number.isFinite(venue.lat) && Number.isFinite(venue.lon)"
          class="kbts-venue-view-map"
          :lat="venue.lat"
          :lon="venue.lon"
          :name="venue.name"
          :zoom="15"
      />

    </div>

  </div>


  <!-- Events -->
  <section
      v-if="venue"
      class="kbts-venue-view-events"
  >
    <h2 class="kbts-venue-view-events-title">
      {{ t('events.upcoming_events_title') }}
    </h2>

    <hr>

    <EventsView
        :venue-uuid="venue.uuid"
        :use-filters="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageUrl } from '~/utils/image'
import { useThemeStore } from "~/stores/themeStore";
import LogoImage  from '~/components/ui/LogoImage.vue'
import SinglePointMap from '~/components/map/SinglePointMap.client.vue'
import EventsView from '~/components/event/EventsView.vue'
import FacebookShareButton from '~/components/ui/FacebookShareButton.vue'
import type { Venue, VenueResponse } from '~/types/venue'
import { truncateText } from '~/utils/text'
import { ogLocale } from '~/utils/locale'

defineI18nRoute({
  paths: {
    de: '/ort/[venue_identifier]',
    da: '/sted/[venue_identifier]',
    en: '/venue/[venue_identifier]'
  }
})

const route = useRoute()
const { locale, t } = useI18n()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const themeStore = useThemeStore()

const { renderMarkdown } = useMarkdown()
const { countryName } = useCountryName()

const venueUuid = route.params.venue_identifier as string

async function fetchVenue(): Promise<VenueResponse> {
  return await $api<VenueResponse>(
      `/api/venue/${venueUuid}`,
      {
        query: {
          lang: locale.value
        }
      }
  )
}

const { data: venueResponse } = await useAsyncData(
    () => `venue-${venueUuid}-${locale.value}`,
    fetchVenue,
    {
      watch: [locale]
    }
)

const venue = computed<Venue | undefined>(
    () => venueResponse.value?.data
)

const canonicalUrl = computed(() =>
    new URL(route.path, config.public.siteUrl).href
)

const venueImage = computed(() => venue.value?.images?.main_photo)
const venueLogos = computed(() => {
  return venue.value?.logos
})

const descriptionHtml = computed(() =>
    venue.value?.description
        ? renderMarkdown(venue.value.description)
        : ''
)


const imageCredit = computed(() => {
  const image = venueImage.value
  if (!image) {
    return null
  }

  const parts: string[] = []
  if (image.creator) {
    parts.push(image.creator)
  }
  if (image.copyright) {
    parts.push(`© ${image.copyright}`)
  }
  if (image.license_name) {
    parts.push(image.license_name)
  }
  if (!parts.length) {
    return null
  }
  return `${t('venue.image_by')}: ${parts.join(', ')}`
})

const venueSchema = computed(() => {
  if (!venue.value) return null

  const v = venue.value

  return {
    '@context': 'https://schema.org',
    '@type': 'Place',

    name: v.name,

    description: v.description,

    image: v.images?.main_photo?.url
        ? [imageUrl(v.images.main_photo.url, 1200, '16:9')]
        : undefined,

    address: {
      '@type': 'PostalAddress',
      streetAddress: [
        v.street,
        v.house_number
      ]
          .filter(Boolean)
          .join(' '),

      postalCode: v.postal_code,
      addressLocality: v.city,
      addressCountry: countryName(v.country)
    },

    geo: Number.isFinite(v.lat) && Number.isFinite(v.lon)
        ? {
          '@type': 'GeoCoordinates',
          latitude: v.lat,
          longitude: v.lon
        }
        : undefined,

    url: canonicalUrl.value,
  }
})

useHead(() => ({
  htmlAttrs: {
    lang: locale.value
  },
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: canonicalUrl.value
    }
  ],
  script: venueSchema.value
      ? [
        {
          key: 'venue-schema',
          type: 'application/ld+json',
          innerHTML: JSON.stringify(venueSchema.value)
        }
      ]
      : []
}))

const pageUrl = computed(() => `${config.public.siteUrl}${route.fullPath}`)
const description = computed(() => truncateText(venue.value?.description, 160))

useSeoMeta({
  title: venue.value?.name,
  description: description,

  ogType: 'website',
  ogSiteName: t('siteName'),
  ogLocale: ogLocale(locale.value),
  ogTitle: venue.value?.name,
  ogDescription: description,
  ogUrl: pageUrl,
  ogImage: venue.value?.images?.main_photo?.url
      ? imageUrl(venue.value.images.main_photo.url, 1200, '16:9')
      : undefined,
  ogImageWidth: '1200',
  ogImageHeight: '675',
  ogImageAlt: venue.value?.images?.main_photo?.alt || venue.value?.name,

  twitterCard: 'summary_large_image',
  twitterTitle: venue.value?.name,
  twitterDescription: description,
  twitterImage: venue.value?.images?.main_photo?.url
      ? imageUrl(venue.value.images.main_photo.url, 1200, '16:9')
      : undefined,

  robots: venue.value ? 'index,follow' : 'noindex'
})
</script>

<style lang="scss">
.kbts-venue-view-events {
  margin-top: 3rem;
}

.kbts-venue-view-events-title {
  font-size: 2rem;
  font-weight: 300;
  margin: 0 0 1rem;
}

.kbts-venue-view-share {
  margin-top: 1rem;
}

.kbts-venue-view-image {
  .kbts-venue-view-image-outer {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;

    .kbts-venue-view-image-inner {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      transition: transform .2s ease;

      &.has-placeholder {
        background: #eee;
      }
    }
  }
}
</style>
