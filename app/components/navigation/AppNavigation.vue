<template>
  <header
    class="navigation"
    :class="{ 'portal-navigation': isPortalActive }"
    :style="navigationStyle"
  >
    <DesktopNavigation
      :events-link="portalEventsLink"
      :filters-open="filtersOpen"
      :can-exit-portal="canExitPortal"
      @toggle-filters="toggleFilters"
      @info-opened="closeFilters"
      @exit-portal="endPortal"
    />

    <MobileNavigation
      :events-link="portalEventsLink"
      :filters-open="filtersOpen"
      :can-exit-portal="canExitPortal"
      @toggle-filters="toggleFilters"
      @info-opened="closeFilters"
      @exit-portal="endPortal"
    />

    <NavigationFilters
      :open="filtersOpen"
      @close="closeFilters"
      @show="showResults"
    />
  </header>
</template>

<script setup lang="ts">
import DesktopNavigation from './DesktopNavigation.vue'
import MobileNavigation from './MobileNavigation.vue'
import NavigationFilters from './NavigationFilters.vue'
import type { FilterType } from '~/stores/filtersStore'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const filtersStore = useFiltersStore()
const editingStore = useEventFilterEditingStore()
const { isMobile } = useMobileViewport()
const { clearPortal } = usePortal()
const { isPortalActive, navigationStyle } = useNavigationStyle()
const filtersOpenRoute = useState<string | null>(
  'navigation-filters-open-route',
  () => null
)
const openFiltersAfterNavigation = useState(
  'navigation-filters-open-after-navigation',
  () => false
)
const filtersOpen = computed({
  get: () => filtersOpenRoute.value === route.path,
  set: (open: boolean) => {
    filtersOpenRoute.value = open ? route.path : null
  },
})

const routeFilterType = computed<FilterType | null>(() => {
  const filterType = route.meta?.filters

  if (filterType === 'events' || filterType === 'venues') {
    return filterType
  }

  return null
})
const canExitPortal = computed(() => Boolean(filtersStore.eventPortalUuid))

// Own the session in navigation so route changes and viewport changes also finish it.
watch([filtersOpen, routeFilterType, isMobile, openFiltersAfterNavigation], ([open, type, mobile, pending]) => {
  if (mobile === true && (pending || (open && type === 'events'))) editingStore.beginMobileFilterEditing()
  else editingStore.finishMobileFilterEditing()
}, { flush: 'sync' })

onBeforeUnmount(() => editingStore.finishMobileFilterEditing())

const portalEventsLink = computed(() => {
  const portalIdentifier = filtersStore.eventPortalIdentifier

  return portalIdentifier
      ? localePath({
        name: 'portal-portal_identifier-events',
        params: {
          portal_identifier: portalIdentifier
        }
      })
      : localePath('events')
})

async function toggleFilters() {
  if (filtersOpen.value) {
    closeFilters()
    return
  }

  const currentFilterType = routeFilterType.value

  if (currentFilterType) {
    filtersStore.setFilter(currentFilterType)
    filtersOpen.value = true
    return
  }

  openFiltersAfterNavigation.value = true
  const navigationFailure = await router.push(portalEventsLink.value)

  if (navigationFailure) {
    openFiltersAfterNavigation.value = false
  }
}

function closeFilters() {
  const restoreMobileFocus = editingStore.isMobileFilterEditing
  openFiltersAfterNavigation.value = false
  filtersOpen.value = false
  if (restoreMobileFocus) {
    void nextTick(() => {
      document.querySelector<HTMLElement>('.navigation-search--mobile-navigation')?.focus({ preventScroll: true })
    })
  }
}

async function showResults() {
  closeFilters()
  await nextTick()
  const results = document.querySelector<HTMLElement>('[data-event-results]')
  results?.focus({ preventScroll: true })
  results?.scrollIntoView({ block: 'start' })
}

function endPortal() {
  clearPortal()
  filtersStore.setFilter('events')
  router.push(localePath('events'))
}

function openPendingFilters() {
  const filterType = routeFilterType.value

  if (!openFiltersAfterNavigation.value || !filterType) return false

  filtersStore.setFilter(filterType)
  filtersOpen.value = true
  openFiltersAfterNavigation.value = false
  return true
}

watch(
  [() => route.path, routeFilterType],
  () => {
    if (openPendingFilters()) return

    filtersOpen.value = false
  },
  { flush: 'post' }
)

onMounted(openPendingFilters)
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
