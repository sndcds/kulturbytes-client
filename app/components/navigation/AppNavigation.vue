<template>
  <header
    class="navigation"
    :class="{ 'portal-navigation': isPortalActive }"
    :style="navigationStyle"
  >
    <DesktopNavigation
      :events-link="portalEventsLink"
      :filters-open="filtersOpen"
      :has-filters="hasFilters"
      :can-exit-portal="canExitPortal"
      @toggle-filters="toggleFilters"
      @info-opened="closeFilters"
      @exit-portal="endPortal"
    />

    <MobileNavigation
      :events-link="portalEventsLink"
      :filters-open="filtersOpen"
      :has-filters="hasFilters"
      :can-exit-portal="canExitPortal"
      @toggle-filters="toggleFilters"
      @info-opened="closeFilters"
      @exit-portal="endPortal"
    />

    <NavigationFilters
      :open="filtersOpen"
      :has-filters="hasFilters"
      @close="closeFilters"
    />
  </header>
</template>

<script setup lang="ts">
import DesktopNavigation from './DesktopNavigation.vue'
import MobileNavigation from './MobileNavigation.vue'
import NavigationFilters from './NavigationFilters.vue'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const filtersStore = useFiltersStore()
const { clearPortal } = usePortal()
const { isPortalActive, navigationStyle } = useNavigationStyle()
const filtersOpen = ref(false)

const hasFilters = computed(() => Boolean(route.meta?.filters))
const canExitPortal = computed(() => Boolean(filtersStore.eventPortalUuid))
const portalEventsLink = computed(() => {
  const portalIdentifier = filtersStore.eventPortalIdentifier

  return portalIdentifier
    ? localePath(`/portal/${portalIdentifier}/events`)
    : localePath('events')
})

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value
}

function closeFilters() {
  filtersOpen.value = false
}

function endPortal() {
  clearPortal()
  filtersStore.setFilter('events')
  router.push(localePath('events'))
}

watch(() => route.path, closeFilters)
</script>

<style scoped lang="scss">
.navigation {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--kbts-bg);
  border-bottom: 1px solid var(--kbts-border);
}
</style>
