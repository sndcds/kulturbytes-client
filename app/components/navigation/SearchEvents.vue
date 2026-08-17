<template>
  <div class="filter-button-group">
    <button
        class="filter-button"
        :aria-expanded="filtersOpen"
        aria-label="Toggle filters"
        @click="emit('toggle-filters')"
    >
      <Search :size="18" />
      {{ t('filter.search') }}
    </button>

    <button
        class="filter-x"
        aria-label="Reset filters"
        @click="emit('reset-filters')"
    >
      <FunnelX :size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { FunnelX, Search } from '@lucide/vue'

withDefaults(defineProps<{
  hasFilters?: boolean
  filtersOpen?: boolean
}>(), {
  hasFilters: false,
  filtersOpen: false,
})

const emit = defineEmits<{
  'toggle-filters': []
  'reset-filters': []
}>()

const { t } = useI18n()
</script>

<style scoped lang="scss">
.filter-button-group {
  display: flex;
  gap: 0;
}

.filter-button,
.filter-x {
  display: flex;
  align-items: center;
  gap: .5rem;
  border: 1px solid var(--kbts-border);
  background: white;
  border-radius: 0;
  padding: .45rem .85rem;
  cursor: pointer;
  font-size: .9rem;
  transition: .2s;

  &:hover {
    background: var(--kbts-fg);
    color: var(--kbts-bg);
    border-color: var(--kbts-fg);
  }
}

.filter-button {
  border-top-left-radius: .25rem !important;
  border-bottom-left-radius: .25rem !important;
}

.filter-x {
  border-top-right-radius: .25rem !important;
  border-bottom-right-radius: .25rem !important;
  border-left-width: 0;
}

@media (max-width: 768px) {
  .filter-button-group {
    padding: .75rem;
  }

  .filter-button {
    padding: .35rem .65rem;
    font-size: .85rem;
  }
}
</style>