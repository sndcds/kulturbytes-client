<template>
  <div v-if="type === 'filters' && hasFilters" class="filter-button-group">
    <button
      class="filter-button"
      :aria-expanded="filtersOpen"
      aria-label="Toggle filters"
      @click="emit('toggle-filters')"
    >
      <SlidersHorizontal :size="18" />{{ t('filter.button_label') }}
    </button>
    <button class="filter-x" aria-label="Reset filters" @click="emit('reset-filters')">
      <FunnelX :size="18" />
    </button>
  </div>

  <div v-else-if="type === 'mobile'" class="nav-actions">
    <button class="menu-toggle" aria-label="Toggle navigation" @click="emit('toggle-navigation')">
      <span />
      <span />
      <span />
    </button>
  </div>
</template>

<script setup lang="ts">
import { FunnelX, SlidersHorizontal } from '@lucide/vue'

withDefaults(defineProps<{
  type: 'filters' | 'mobile'
  hasFilters?: boolean
  filtersOpen?: boolean
}>(), {
  hasFilters: false,
  filtersOpen: false,
})

const emit = defineEmits<{
  'toggle-filters': []
  'reset-filters': []
  'toggle-navigation': []
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

.nav-actions {
  display: none;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.menu-toggle {
  display: none;
  border: 0;
  background: none;
  cursor: pointer;

  span {
    display: block;
    width: 24px;
    height: 2px;
    background: #111;
    margin: 5px;
  }
}

@media (max-width: 768px) {
  .nav-actions {
    display: flex;
    gap: .5rem;
  }

  .menu-toggle {
    display: block;
  }

  .filter-button-group {
    padding: .75rem;
  }

  .filter-button {
    padding: .35rem .65rem;
    font-size: .85rem;
  }
}
</style>
