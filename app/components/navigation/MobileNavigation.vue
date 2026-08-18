<template>
  <div class="mobile-navigation">
    <div class="mobile-top-bar">
      <NavigationLogo />

      <div class="mobile-top-actions">

        <KulturbytesIcon
          v-if="canExitPortal"
          :size="38"
          :aria-label="t('nav.end_portal')"
          :title="t('nav.end_portal')"
          @click="emit('exit-portal')"
        />

        <NavigationInfoMenu variant="mobile-top" @opened="emit('info-opened')" />
      </div>
    </div>

    <nav class="mobile-bottom-nav" :aria-label="t('nav.mobile_navigation')">
      <NuxtLink :to="eventsLink" class="mobile-nav-item">
        <CalendarDays :size="28" aria-hidden="true" />
        <span>{{ t('nav.events') }}</span>
      </NuxtLink>

      <NuxtLink :to="localePath('venue-map')" class="mobile-nav-item">
        <MapPin :size="28" aria-hidden="true" />
        <span>{{ t('nav.venues') }}</span>
      </NuxtLink>

      <NavigationSearch
        variant="mobile-navigation"
        :filters-open="filtersOpen"
        @toggle="emit('toggle-filters')"
      />

      <LanguageSwitcher variant="mobile-navigation" />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays, LogOut, MapPin } from '@lucide/vue'
import KulturbytesIcon from '~/components/ui/KulturbytesIcon.vue'
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
.mobile-navigation {
  display: none;
}

@media (max-width: 768px) {
  .mobile-navigation {
    display: block;
  }

  .mobile-top-bar {
    box-sizing: border-box;
    width: 100%;
    height: var(--kbts-nav-height);
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .mobile-top-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: .35rem;
  }

  .portal-exit-button {
    width: 42px;
    height: 42px;
    padding: 0;
    display: inline-grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--kbts-fg);
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: var(--kbts-card-bg);
    }
  }

  .mobile-bottom-nav {
    position: fixed;
    z-index: 110;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: var(--kbts-mobile-nav-height);
    padding-bottom: env(safe-area-inset-bottom);
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: stretch;
    background: var(--kbts-bg);
    border-top: 1px solid var(--kbts-border);
    box-shadow: 0 -8px 24px rgba(0, 0, 0, .06);
  }

  .mobile-nav-item {
    min-width: 0;
    min-height: var(--kbts-mobile-nav-height);
    padding: .5rem .25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .2rem;
    color: var(--kbts-muted-fg);
    font-size: .72rem;
    font-weight: 500;
    text-decoration: none;

    &:hover,
    &:focus-visible,
    &.router-link-active {
      color: var(--kbts-fg);
    }

    &.router-link-active {
      font-weight: 700;
      box-shadow: inset 0 2px var(--kbts-fg);
    }
  }
}
</style>
