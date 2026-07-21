<template>
  <div class="venue-popup">
    <div class="content">
      <h3>
        {{ venue.name }}
      </h3>

      <div v-if="venue.street || venue.city">
        {{ venue.street }} {{ venue.house_number }}, {{ venue.postal_code }} {{ venue.city }}
      </div>
    </div>

    <div class="action">
      <a
          v-if="venue.web_link"
          class="link"
          :href="venue.web_link"
          target="_blank"
          rel="noopener noreferrer"
      >
        Website
      </a>
      <NuxtLink class="link">
        Details
      </NuxtLink>
    </div>

  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  feature?: any
}>()

const venue = computed(() =>
    props.feature?.properties ?? {}
)
</script>


<style scoped>
.venue-popup {
  display: flex;
  flex-direction: column;
  min-width: 240px;

  .content {
    padding: .5rem 1rem;
  }

  .action {
    display: flex;
    gap: 2px;
    padding: 2px;
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
    padding: 0.5rem;
    background: var(--kbts-card-bg);
    transition: all 0.2s ease;

    &:hover {
      background: var(--kbts-fg);
      color: var(--kbts-bg);
    }
  }
}

</style>