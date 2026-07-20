<template>

  <header class="navigation">

    <div class="nav-inner">

      <!-- Logo -->
      <NuxtLink
          :to="localePath('/')"
          class="logo"
      >
        <AppLogo />
      </NuxtLink>


      <!-- Main navigation -->
      <nav :class="{ open }">
        <NuxtLink :to="localePath('/events')">
          {{ t('nav.events') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/venues/venues')">
          {{ t('nav.venues') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/venues/map')">
          {{ t('nav.map') }}
        </NuxtLink>

        <NuxtLink :to="localePath('/about')">
          {{ t('nav.about') }}
        </NuxtLink>

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
            <X :size="18"/>
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
import { SlidersHorizontal, X } from '@lucide/vue'
import { useFiltersStore } from "~/stores/filtersStore";

const { t } = useI18n()

const route = useRoute()
const open = ref(false)

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

watch(
    () => route.path,
    () => {
      open.value = false
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

  a {
    color: var(--kbts-fg);
    text-decoration: none;
    font-weight: 400;
    border-bottom: 2px solid transparent;

    &:hover {
      color: red;
    }

    &.router-link-active {
      font-weight: 700;
    }
  }
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
  gap: .5rem;

  a {
    padding: .25rem .5rem;
    font-size: .85rem;
    color: var(--kbts-fg);
    border-bottom: 1px solid transparent;

    &.active {
      border-bottom: 1px solid var(--kbts-fg);
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

    a {
      padding: 1rem 0;
      font-size: 1.2rem;
    }

    &.open {
      display: flex;
    }
  }

  .language-switcher {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,0,0,.08);
  }

  .filter-panel {
    max-height: calc(100vh - 60px);
  }
}

</style>