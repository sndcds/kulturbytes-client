<template>
  <button
    type="button"
    class="navigation-search"
    :class="`navigation-search--${variant}`"
    :aria-label="t('filter.search')"
    :aria-expanded="filtersOpen"
    aria-controls="navigation-filters"
    @click="emit('toggle')"
  >
    <SearchX v-if="filtersOpen" :size="iconSize" aria-hidden="true" />
    <Search v-else :size="iconSize" aria-hidden="true" />
    <span :class="{ 'visually-hidden': variant === 'mobile' }">
      {{ t('filter.search') }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { Search, SearchX } from '@lucide/vue'

const props = defineProps<{
  variant: 'desktop' | 'mobile'
  filtersOpen: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()
const { t } = useI18n()
const iconSize = computed(() => props.variant === 'mobile' ? 23 : 18)
</script>

<style scoped lang="scss">
.navigation-search {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;
  cursor: pointer;
}

.navigation-search--desktop {
  position: relative;
  gap: .45rem;
  padding: .25rem;

  &::after {
    content: "";
    position: absolute;
    left: 10%;
    bottom: -.3rem;
    width: 80%;
    height: 2px;
    background: var(--kbts-muted-fg-light);
    border-radius: 99px;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform .25s ease;
  }

  &:hover::after,
  &:focus-visible::after,
  &[aria-expanded="true"]::after {
    transform: scaleX(1);
  }

  &[aria-expanded="true"] {
    font-weight: 700;
  }
}

.navigation-search--mobile {
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;

  &:hover,
  &:focus-visible,
  &[aria-expanded="true"] {
    background: var(--kbts-card-bg);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
