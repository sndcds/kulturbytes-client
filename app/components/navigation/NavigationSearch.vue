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
    <span>
      {{ t('filter.search') }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { Search, SearchX } from '@lucide/vue'

const props = defineProps<{
  variant: 'desktop' | 'mobile-navigation'
  filtersOpen: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()
const { t } = useI18n()
const iconSize = computed(() => props.variant === 'mobile-navigation' ? 21 : 18)
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

.navigation-search--mobile-navigation {
  width: 100%;
  min-width: 0;
  min-height: var(--kbts-mobile-nav-height);
  padding: .5rem .25rem;
  flex-direction: column;
  gap: .2rem;
  color: var(--kbts-muted-fg);
  font-size: .72rem;
  font-weight: 500;

  &:hover,
  &:focus-visible,
  &[aria-expanded="true"] {
    color: var(--kbts-fg);
  }

  &[aria-expanded="true"] {
    font-weight: 700;
    box-shadow: inset 0 2px var(--kbts-fg);
  }
}
</style>
