<template>
  <div class="desktop-navigation">
    <NavigationLogo />

    <nav class="desktop-nav" :aria-label="t('nav.primary_navigation')">
      <div class="primary-links">
        <NuxtLink :to="eventsLink">{{ t('nav.events') }}</NuxtLink>
        <NuxtLink :to="localePath('venue-map')">{{ t('nav.venues') }}</NuxtLink>
        <NavigationInfoMenu variant="desktop" @opened="emit('info-opened')" />
      </div>

      <div class="secondary-links">
        <NavigationSearch
          variant="desktop"
          :filters-open="filtersOpen"
          @toggle="emit('toggle-filters')"
        />

        <button
          v-if="canExitPortal"
          type="button"
          class="portal-exit-button"
          @click="emit('exit-portal')"
        >
          {{ t('nav.end_portal') }}
        </button>

        <LanguageSwitcher variant="desktop" />
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from '~/components/ui/LanguageSwitcher.vue'
import NavigationInfoMenu from './NavigationInfoMenu.vue'
import NavigationLogo from './NavigationLogo.vue'
import NavigationSearch from './NavigationSearch.vue'

defineProps<{
  eventsLink: string
  filtersOpen: boolean
  canExitPortal: boolean
}>()

const emit = defineEmits<{
  'toggle-filters': []
  'info-opened': []
  'exit-portal': []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped lang="scss">
.desktop-navigation {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  height: var(--kbts-nav-height);
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

.desktop-nav,
.primary-links,
.secondary-links {
  display: flex;
  align-items: center;
}

.desktop-nav {
  flex: 1;
  min-width: 0;
  margin-left: 2rem;
}

.primary-links,
.secondary-links {
  gap: 1rem;
}

.secondary-links {
  margin-left: auto;
}

.primary-links > a {
  position: relative;
  padding: .25rem;
  color: var(--kbts-fg);
  text-decoration: none;
  font: inherit;
  font-weight: 400;

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
  &:focus-visible::after {
    transform: scaleX(1);
  }

  &.router-link-active {
    color: var(--kbts-fg);
    font-weight: 700;

    &::after {
      transform: scaleX(1);
      background: var(--kbts-fg);
    }
  }
}

.portal-exit-button {
  padding: .45rem .75rem;
  border: 1px solid var(--kbts-border);
  background: var(--kbts-bg);
  color: var(--kbts-fg);
  font: inherit;
  cursor: pointer;
  transition: background .2s ease, color .2s ease;

  &:hover,
  &:focus-visible {
    background: var(--kbts-fg);
    color: var(--kbts-bg);
  }
}

@media (max-width: 768px) {
  .desktop-navigation {
    display: none;
  }
}
</style>
