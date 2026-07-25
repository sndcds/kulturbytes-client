<template>
  <div
      v-if="venue"
      class="kbts-venue-view-layout"
  >
    <div class="kbts-venue-view-layout-left">

      <!-- Image -->
      <div class="kbts-venue-view-image">
        <div
            v-if="venueImage"
            class="kbts-venue-view-image-outer"
        >
          <div
              class="kbts-venue-view-image-inner"
              :class="{ 'has-placeholder': !venueImage }"
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

    <div class="kbts-venue-view-layout-right">

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
          style="margin-bottom: 1rem;"
      />

      <div class="kbts-venue-view-venue kbts-flex-col">
        <span class="kbts-venue-view-label">{{ t('address') }}</span>
        <span>{{ venue.name }}</span>
        <span v-if="venue.street || venue.house_number">
          {{ [venue.street, venue.house_number].filter(Boolean).join(' ') }}
        </span>
        <span v-if="venue.postal_code || venue.city">
          {{ [venue.postal_code, venue.city].filter(Boolean).join(' ') }}
        </span>
      </div>

      <div
          v-if="venue.organization"
          class="kbts-venue-view-venue kbts-flex-col"
      >
        <span class="kbts-venue-view-label">{{ t('organization') }}</span>
        <a
            v-if="venue.organization?.web_link"
            :href="venue.organization.web_link"
            target="_blank"
        >
          {{ venue.organization?.name }}
        </a>
        <span v-else>
          {{ venue.organization?.name }}
        </span>
      </div>

      <SinglePointMap
          v-if="venue.lat && venue.lon"
          class="kbts-event-view-map"
          :lat="venue.lat"
          :lon="venue.lon"
          :name="venue.name"
          :zoom="15"
          height="400px"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageUrl } from '~/utils/image'
import { useThemeStore } from "~/stores/themeStore";
import LogoImage  from '~/components/ui/LogoImage.vue'
import SinglePointMap from '~/components/map/SinglePointMap.client.vue'
import type { Venue, VenueResponse } from '~/types/venue'


const route = useRoute()
const { locale, t } = useI18n()
const { $api } = useNuxtApp()
const themeStore = useThemeStore()

const { renderMarkdown } = useMarkdown()

const venueUuid = route.params.venue_uuid as string

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
</script>

<style lang="scss">
.kbts-venue-view-content {
  grid-area: content;
}

.kbts-venue-view-image {
  grid-area: image;

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