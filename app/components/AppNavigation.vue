<template>

  <header class="navigation">

    <div class="nav-inner">

      <!-- Logo -->
      <NuxtLink
          :to="localePath('/')"
          class="logo"
          :aria-label="t('logo_label')"
      >
        <AppLogo />
      </NuxtLink>


      <!-- Main navigation -->
      <nav :class="{ open }">
        <NuxtLink :to="localePath('events')">
          {{ t('nav.events') }}
        </NuxtLink>

        <!--NuxtLink :to="localePath('/venues/venues')"> TODO: ?
          {{ t('nav.venues') }}
        </NuxtLink-->

        <NuxtLink :to="localePath('venue-map')">
          {{ t('nav.map') }}
        </NuxtLink>

        <div
            ref="infoNav"
            class="info-nav"
            :class="{ open: infoMenuVisible }"
            @mouseenter="openInfoMenu"
            @mouseleave="closeInfoMenuIfUnfocused"
            @focusin="openInfoMenu"
            @focusout="closeInfoMenuIfUnfocused"
        >
          <button
              type="button"
              class="info-button"
              aria-haspopup="menu"
              :aria-expanded="infoMenuVisible"
              @click="toggleInfoMenu"
              @keydown.esc="closeInfoMenu"
          >
            {{ t('nav.info') }}
          </button>

          <div
              class="info-menu info-menu-desktop"
              role="menu"
          >
            <NuxtLink
                :to="localePath('about')"
                role="menuitem"
            >
              {{ t('nav.about') }}
            </NuxtLink>
            <NuxtLink
                :to="localePath('/support')"
                role="menuitem"
            >
              {{ t('nav.support') }}
            </NuxtLink>
            <NuxtLink
                :to="localePath('/kontakt')"
                role="menuitem"
            >
              {{ t('nav.contact') }}
            </NuxtLink>
            <NuxtLink
                :to="localePath('/impressum')"
                role="menuitem"
            >
              {{ t('nav.imprint') }}
            </NuxtLink>
          </div>

          <div class="info-menu-mobile">
            <NuxtLink :to="localePath('about')">
              {{ t('nav.about') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/support')">
              {{ t('nav.support') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/kontakt')">
              {{ t('nav.contact') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/impressum')">
              {{ t('nav.imprint') }}
            </NuxtLink>
          </div>
        </div>

        <div class="language-switcher">
          <NuxtLink
              v-for="locale in locales"
              :key="locale.code"
              :to="switchLocalePath(locale.code)"
              :class="{ active: locale.code === currentLocale }"
          >
            {{ locale.code.toLowerCase() }}
          </NuxtLink>
        </div>
      </nav>

      <!-- Right actions -->
      <div class="nav-actions">

        <!-- Filter button -->
        <div class="filter-button-group">
          <button
              v-if="hasFilters"
              class="filter-button"
              :aria-expanded="filtersOpen"
              aria-label="Toggle filters"
              @click="filtersOpen = !filtersOpen"
          >
            <SlidersHorizontal :size="18"/>{{ t('filter.button_label') }}
          </button>

          <button
              v-if="hasFilters"
              class="filter-x"
              aria-label="Reset filters"
              @click="resetFilters"
          >
            <FunnelX :size="18"/>
          </button>
        </div>


        <!-- Mobile menu -->
        <button
            class="menu-toggle"
            aria-label="Toggle navigation"
            @click="open = !open"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

    </div>


    <!-- Filter panel -->
    <Transition name="filters">
      <div
          v-if="filtersOpen && hasFilters"
          class="filter-panel"
      >
        <div class="filter-inner">
          <button
              class="close-button"
              aria-label="Close filters"
              @click="filtersOpen = false"
          >
            ✕
          </button>

          <div class="filter-content">
            <EventFilters
                v-if="eventFilters.filterType === 'events'"
            />
            <VenueFilters
                v-else-if="eventFilters.filterType === 'venues'"
            />
          </div>

        </div>
      </div>
    </Transition>

  </header>
</template>


<script setup lang="ts">
import AppLogo from '~/components/ui/AppLogo.vue'
import EventFilters from '~/components/filters/EventFilters.vue'
import VenueFilters from '~/components/filters/VenueFilters.vue'
import { SlidersHorizontal, FunnelX } from '@lucide/vue'
import { useFiltersStore } from "~/stores/filtersStore";

const { t } = useI18n()

const route = useRoute()
const open = ref(false)
const infoOpen = ref(false)
const infoNav = ref<HTMLElement | null>(null)
const isMobileNavigation = ref(false)

const filtersOpen = ref(false)
const eventFilters = useFiltersStore()

const {
  locale: currentLocale,
  locales
} = useI18n()

const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const hasFilters = computed(() => {
  return Boolean(route.meta?.filters)
})

const resetFilters = () => {
  eventFilters.resetFilters()
  // filtersOpen.value = false // optional
}

const infoMenuVisible = computed(() => {
  return isMobileNavigation.value || infoOpen.value
})

function openInfoMenu() {
  if (!isMobileNavigation.value) {
    infoOpen.value = true
  }
}

function closeInfoMenu() {
  if (!isMobileNavigation.value) {
    infoOpen.value = false
  }
}

function toggleInfoMenu() {
  if (!isMobileNavigation.value) {
    infoOpen.value = !infoOpen.value
  }
}

function closeInfoMenuIfUnfocused() {
  if (isMobileNavigation.value) {
    return
  }

  requestAnimationFrame(
      () => {
        if (!infoNav.value?.contains(document.activeElement)) {
          infoOpen.value = false
        }
      }
  )
}

function closeInfoMenuOnOutsideClick(event: MouseEvent) {
  if (
      !isMobileNavigation.value &&
      infoOpen.value &&
      infoNav.value &&
      event.target instanceof Node &&
      !infoNav.value.contains(event.target)
  ) {
    infoOpen.value = false
  }
}

function updateNavigationMode() {
  isMobileNavigation.value = window.matchMedia('(max-width: 768px)').matches
}

onMounted(() => {
  updateNavigationMode()
  window.addEventListener('resize', updateNavigationMode)
  document.addEventListener('click', closeInfoMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateNavigationMode)
  document.removeEventListener('click', closeInfoMenuOnOutsideClick)
})

watch(
    () => route.path,
    () => {
      open.value = false
      infoOpen.value = false
      filtersOpen.value = false
    }
)

</script>


<style scoped lang="scss">

.navigation {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid var(--kbts-border);
}

/*
 Header row
*/
.nav-inner {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  color: var(--kbts-fg);
  text-decoration: none;
}

/*
 Right side controls
*/
.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

/*
 Filter button
*/
.filter-button-group {
  display: flex;
  gap: 0;
}

.filter-button, .filter-x {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border-top-left-radius: 0.25rem !important;
  border-bottom-left-radius: 0.25rem !important;
}

.filter-x {
  border-top-right-radius: 0.25rem !important;
  border-bottom-right-radius: 0.25rem !important;
  border-left-width: 0;
}

nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: 2rem;

  > a,
  .info-button {
    position: relative;
    padding: 0.25rem;
    color: var(--kbts-fg);
    background: transparent;
    border: 0;
    text-decoration: none;
    font-weight: 400;
    font: inherit;
    cursor: pointer;
    transition: color 0.25s ease;

    &::after {
      content: "";
      position: absolute;
      left: 10%;
      bottom: -0.3rem;
      width: 80%;
      height: 2px;

      background: var(--kbts-muted-fg-light);
      border-radius: 99px;

      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.25s ease;
    }

    &:hover {
      color: var(--kbts-fg);

      &::after {
        transform: scaleX(1);
      }
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
}

.info-nav {
  position: relative;
}

.info-menu-mobile {
  display: none;
}

.info-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  min-width: 180px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: var(--kbts-bg);
  border: 1px solid var(--kbts-border);
  border-radius: 8px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -0.25rem);
  transition: opacity 0.18s ease, transform 0.18s ease;

  a {
    padding: 0.65rem 0.75rem;
    color: var(--kbts-fg);
    text-decoration: none;
    font-weight: 400;
    border-radius: 6px;
    white-space: nowrap;
    transition: background 0.18s ease;

    &:hover,
    &:focus-visible,
    &.router-link-active {
      background: rgba(0, 0, 0, 0.06);
    }
  }
}

.info-nav:hover .info-menu,
.info-nav:focus-within .info-menu,
.info-nav.open .info-menu {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
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

.language-switcher {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-left: 1rem;

  a {
    color: var(--kbts-muted-fg);
    text-decoration: none;
    font-size: .9rem;
    font-weight: 400;
    transition: color .2s ease;
    padding: .25rem;

    &:hover {
      color: var(--kbts-fg);
    }

    &.active {
      color: var(--kbts-fg);
      font-weight: 700;
    }
  }
}

.filter-panel {
  background: white;
  border-top: 1px solid var(--kbts-border);
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  scrollbar-gutter: stable;
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

.filter-content {
  color: #666;
}

/*
 Fade animation only
*/
.filters-enter-active,
.filters-leave-active {
  transition: opacity .25s ease;
}

.filters-enter-from,
.filters-leave-to {
  opacity: 0;
}

.filters-enter-to,
.filters-leave-from {
  opacity: 1;
}

@media (max-width: 768px) {
  .nav-inner {
    padding: .75rem 1rem;
  }

  .nav-actions {
    gap: .5rem;
  }

  .filter-button {
    padding: .35rem .65rem;
    font-size: .85rem;
  }

  .menu-toggle {
    display: block;
  }

  nav {
    position: fixed;
    top: 58px;
    left: -32px;
    right: 0;
    bottom: 0;

    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0;

    background: var(--kbts-bg);
    padding: 2rem 2rem;

    overflow-y: auto;

    a,
    .info-button {
      padding: 1rem 0;
      font-size: 1.2rem;
      text-align: left;
    }

    > a,
    .info-button {
      padding-inline: 0.75rem;
      border-radius: 6px;

      &::after {
        display: none;
      }

      &:hover,
      &:focus-visible,
      &.router-link-active {
        background: rgba(0, 0, 0, 0.05);
      }
    }

    &.open {
      display: flex;
    }
  }

  .info-nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .info-menu-desktop {
    display: none;
  }

  .info-menu-mobile {
    padding: 0 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0;

    a {
      padding: 0.45rem 0.75rem;
      font-size: 1.05rem;
      color: var(--kbts-muted-fg);
      border-radius: 6px;

      &:hover,
      &:focus-visible,
      &.router-link-active {
        background: rgba(0, 0, 0, 0.04);
        color: var(--kbts-fg);
      }
    }
  }

  .language-switcher {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(1,0,0,1);
  }

  .filter-panel {
    max-height: calc(100vh - 60px);
  }
}

</style>
