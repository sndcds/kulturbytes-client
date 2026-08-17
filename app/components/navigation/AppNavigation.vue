<template>
  <header
    class="navigation"
    :class="{ 'portal-navigation': isPortalActive }"
    :style="navigationStyle"
  >
    <div class="nav-inner">
      <NavigationLogo />
      <NavigationLinks
        ref="navigationLinks"
        :open="open"
        :has-filters="hasFilters"
        :filters-open="filtersOpen"
        @toggle-filters="toggleFilters"
        @reset-filters="resetFilters"
        @info-opened="filtersOpen = false"
        @navigate="open = false"
      />
      <NavigationActions
          type="mobile"
          @toggle-navigation="toggleNavigation" />
    </div>

    <NavigationFilters
      :open="filtersOpen"
      :has-filters="hasFilters"
      @close="filtersOpen = false"
    />
  </header>
</template>

<script setup lang="ts">
import NavigationActions from './NavigationActions.vue'
import NavigationFilters from './NavigationFilters.vue'
import NavigationLinks from './NavigationLinks.vue'
import NavigationLogo from './NavigationLogo.vue'

const route = useRoute()
const filtersStore = useFiltersStore()
const { isPortalActive, navigationStyle } = useNavigationStyle()
const open = ref(false)
const filtersOpen = ref(false)
const navigationLinks = ref<InstanceType<typeof NavigationLinks> | null>(null)
const hasFilters = computed(() => Boolean(route.meta?.filters))

function resetFilters() {
  filtersStore.resetFilters()
}

function toggleFilters() {
  filtersOpen.value = !filtersOpen.value

  if (filtersOpen.value) {
    open.value = false
    navigationLinks.value?.closeInfoMenu()
  }
}

function toggleNavigation() {
  open.value = !open.value

  if (open.value) filtersOpen.value = false
}

watch(
  () => route.path,
  () => {
    open.value = false
    filtersOpen.value = false
    navigationLinks.value?.closeInfoMenu()
  }
)
</script>

<style scoped lang="scss">
.navigation {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--kbts-bg);
  border-bottom: 1px solid var(--kbts-border);
}

.nav-inner {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
}

.portal-navigation .nav-inner {
  height: var(--kbts-nav-height);
  padding: 0 1rem 1rem 1rem;
}

@media (max-width: 768px) {
  .nav-inner {
    padding: .75rem 1rem;
  }
  .portal-navigation .nav-inner {
    padding: 0 1rem;
  }
}
</style>
