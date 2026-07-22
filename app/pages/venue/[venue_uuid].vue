<template>
  <div
      v-if="venue"
      class="kbts-event-view-layout"
  >
    <div class="kbts-event-view-layout-left">
      <!-- Image -->
      <div class="kbts-event-view-image">
        <div
            v-if="venueImage"
            class="kbts-event-view-image-outer"
        >
          <div
              class="kbts-event-view-image-inner"
              :class="{ 'has-placeholder': !venueImage }"
              :style="{
              backgroundImage: `url(${imageUrl(venueImage.url, 960, '16:9')})`
            }"
          />
        </div>

        <span
            v-if="imageCredit"
            class="kbts-event-view-image-caption"
        >
          {{ imageCredit }}
        </span>
      </div>

      <div class="kbts-event-view-content">
        <h1 class="kbts-event-view-title">
          {{ venue.name }}
        </h1>
      </div>
    </div>

    <div class="kbts-event-view-layout-right">
      <!-- empty for now -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { imageUrl } from '~/utils/image'

const route = useRoute()
const { locale, t } = useI18n()
const { $api } = useNuxtApp()

const venueUuid = route.params.venue_uuid as string

async function fetchVenue() {
  return $api(
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

const venue = computed(() => venueResponse.value?.data)

const venueImage = computed(() => venue.value?.images?.main_photo)

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
  return `${t('event.image_by')}: ${parts.join(', ')}`
})
</script>

<style lang="scss">
.kbts-event-view-content {
  grid-area: content;
}

.kbts-event-view-image {
  grid-area: image;

  .kbts-event-view-image-outer {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;

    .kbts-event-view-image-inner {
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