<template>
  <div class="venue-popup">
    <div class="content">
      <h3>
        {{ venue.name }}
      </h3>

      <div v-if="venueAddress">
        {{ venueAddress }}
      </div>
    </div>

    <div class="action">
      <a
          class="link"
          v-if="venue.web_link"
          :href="venue.web_link"
          target="_blank"
          rel="noopener noreferrer"
      >
        {{ t('map.website_link') }}
      </a>

      <NuxtLink
          class="link"
          href="#"
          @click.prevent.stop="openVenue"
      >
        {{ t('map.details_link') }}
      </NuxtLink>
    </div>

  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'

const localePath = useLocalePath()
const { t } = useI18n()

const props = defineProps<{
  feature?: any
}>()

const venue = computed(() =>
    props.feature?.properties ?? {}
)

const venueAddress = computed(() => {
  const streetLine = [venue.value.street, venue.value.house_number]
      .filter(Boolean)
      .join(' ')
  const cityLine = [venue.value.postal_code, venue.value.city]
      .filter(Boolean)
      .join(' ')

  return [streetLine, cityLine].filter(Boolean).join(', ')
})

function openVenue() {
  navigateTo(
      localePath({
        name: 'venue-venue_identifier',
        params: {
          venue_identifier: venue.value.uuid
        }
      })
  )
}
</script>


<style scoped>
.venue-popup {
  display: flex;
  flex-direction: column;
  min-width: 240px;
  pointer-events: auto;

  .content {
    padding: .5rem 1rem;
  }

  .action {
    display: flex;
    gap: .25rem;
  }

  h3 {
    margin: 0;
    padding: 0.5rem 0;
    font-size: 1.2rem;
  }

  .link {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: .5rem;
    background: var(--kbts-card-bg);
    transition: all 0.2s ease;
    border-radius: 999px;

    &:hover {
      background: var(--kbts-fg);
      color: var(--kbts-bg);
    }
  }
}

</style>
