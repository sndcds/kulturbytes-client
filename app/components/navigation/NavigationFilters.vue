<template>
  <Transition name="filters">
    <div v-if="open && filtersStore.filterType" id="navigation-filters" class="filter-panel">
      <div class="filter-inner">
        <div class="filter-content">
          <EventFilters
              v-if="filtersStore.filterType === 'events'"
              @close="emit('close')"
          />
          <VenueFilters v-else-if="filtersStore.filterType === 'venues'" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import EventFilters from '~/components/filters/EventFilters.vue'
import VenueFilters from '~/components/filters/VenueFilters.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{ close: [] }>()
const filtersStore = useFiltersStore()
const { t } = useI18n()
</script>

<style scoped lang="scss">
.filter-panel {
  background: white;
  border-top: 1px solid var(--kbts-border);
  max-height: calc(100vh - var(--kbts-nav-height));
  overflow-y: auto;
  scrollbar-gutter: stable;
}

@media (max-width: 768px) {
  .filter-panel {
    max-height: calc(
      100dvh
      - var(--kbts-nav-height)
      - var(--kbts-mobile-nav-height)
      - env(safe-area-inset-bottom)
    );
  }
}

.filter-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1rem;
}

.close-button {
  position: absolute;
  right: 1rem;
  border: 0;
  background: none;
  cursor: pointer;
  font-size: 1rem;
}

.filter-content { color: #666; }

.filters-enter-active,
.filters-leave-active { transition: opacity .25s ease; }
.filters-enter-from,
.filters-leave-to { opacity: 0; }
.filters-enter-to,
.filters-leave-from { opacity: 1; }
</style>
