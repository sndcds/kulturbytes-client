<script setup lang="ts">
import { Heart } from '@lucide/vue'
import { imageUrl } from '~/utils/image'
import { type CalendarEvent } from '~/types/calendarEvent'
import ReleaseChip from '~/components/event/ui/ReleaseChip.vue'
import EventTypesDisplay from '~/components/event/EventTypesDisplay.vue'

const { locale } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  event: CalendarEvent
}>()
</script>


<template>
  <NuxtLink
      :to="localePath(`/event/${event.uuid}/${event.date_slug}`)"
      class="kbts-events-view-card"
  >
    <div class="kbts-events-view-grid-image">
      <div class="kbts-events-view-image-clip">
        <div
            class="kbts-events-view-image"
            :class="{ 'has-placeholder': !event.image_path }"
            :style="event.image_path ? {
              backgroundImage: `url(${imageUrl(event.image_path, 480, '16:9')})`
            } : {}"
        >
          <Heart
              v-if="!event.image_path"
              class="x_image_icon"
              :size="64"
              :stroke-width="1"
          />
        </div>
      </div>

      <EventPriceBadge
          v-if="event.price_type && ['free', 'donation'].includes(event.price_type)"
          :price-type="event.price_type"
          class="kbts-event-price-badge"
          :size="26"
      />

      <ReleaseChip
          v-if="event.release_status && event.release_status !== 'released'"
          :release-status="event.release_status"
          class="kbts-event-release-chip release-chip-pos big"
      />
    </div>


    <div class="kbts-events-view-card-content">
      <h2>{{ event.title }}</h2>

      {{ formatDate(locale, event.start_date, 'weekday') }} / {{ event.start_time }}
      <br>
      {{ event.venue_name }} / {{ event.venue_city }}
      <br>

      <EventTypesDisplay
          v-if="event.event_types?.length"
          :event-types="event.event_types"
          :show-genres="false"
          class="kbts-events-view-card-types"
      />
    </div>
  </NuxtLink>
</template>


<style scoped lang="scss">
.kbts-events-view-card {
  display: flex;
  flex-direction: column;

  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  background: var(--kbts-card-bg);
  max-width: 600px;

  height: 100%; // important if inside a grid
  color: inherit;
  text-decoration: none;

  &:visited {
    color: inherit;
  }

  &:hover {
    color: inherit;
    text-decoration: none;
  }
}

.kbts-events-view-card-content {
  flex: 1; // take remaining space
  display: flex;
  flex-direction: column;

  padding: .5rem 1rem;
  font-weight: 300;
  font-size: .9rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 300;
    margin: .5rem 0;
  }
}

.kbts-events-view-card-types {
  margin-top: auto;
  padding-top: 1rem;
}

.kbts-events-view-grid-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: visible;
}

.kbts-events-view-image-clip {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.kbts-events-view-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform .2s ease;

  display: flex;
  align-items: center;
  justify-content: center;

  &.has-placeholder {
    background: palegreen;
    color: white;
  }

  &:hover {
    transform: scale(1.06);
  }
}

.release-chip-pos {
  position: absolute;
  top: .75rem;
  left: .75rem;
}
</style>