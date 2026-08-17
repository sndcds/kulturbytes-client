<template>
  <nav :class="{ open }">
    <div class="nav-primary">
      <NuxtLink :to="portalEventsLink">{{ t('nav.events') }}</NuxtLink>
      <NuxtLink :to="localePath('venue-map')">{{ t('nav.venues') }}</NuxtLink>
      <NavigationInfoMenu
          ref="infoMenu"
          @opened="emit('info-opened')"
          @navigate="emit('navigate')"
      />

    </div>

    <div class="nav-secondary">
      <NavigationActions
          type="filters"
          :has-filters="hasFilters"
          :filters-open="filtersOpen"
          @toggle-filters="toggleFilters"
          @reset-filters="emit('reset-filters')"
      />

      <span
        v-if="filtersStore.eventPortalUuid"
        type="button"
        class="portal-exit-button"
        @click="endPortal"
      >
        {{ t('nav.end_portal') }}
      </span>

      <LanguageSwitcher />
    </div>
  </nav>
</template>

<script setup lang="ts">
import LanguageSwitcher from '~/components/ui/LanguageSwitcher.vue'
import NavigationActions from './NavigationActions.vue'
import NavigationInfoMenu from './NavigationInfoMenu.vue'

defineProps<{
  open: boolean
  hasFilters: boolean
  filtersOpen: boolean
}>()

const emit = defineEmits<{
  'toggle-filters': []
  'reset-filters': []
  'info-opened': []
  navigate: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const filtersStore = useFiltersStore()
const { clearPortal } = usePortal()
const infoMenu = ref<InstanceType<typeof NavigationInfoMenu> | null>(null)

const portalEventsLink = computed(() => {
  const portalIdentifier = filtersStore.eventPortalIdentifier

  return portalIdentifier
    ? localePath(`/portal/${portalIdentifier}/events`)
    : localePath('events')
})

function toggleFilters() {
  infoMenu.value?.closeInfoMenu()
  emit('toggle-filters')
}

function closeInfoMenu() {
  infoMenu.value?.closeInfoMenu()
}

function endPortal() {
  clearPortal()
  filtersStore.setFilter('events')
  router.push(localePath('events'))
}

defineExpose({ closeInfoMenu })
</script>

<style scoped lang="scss">
nav {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex: 1;
  margin-left: 2rem;
}

.nav-primary,
.nav-secondary {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.nav-secondary { margin-left: auto; }

.nav-primary > a {
  position: relative;
  padding: .25rem;
  color: var(--kbts-fg);
  background: transparent;
  border: 0;
  text-decoration: none;
  font-weight: 400;
  font: inherit;
  cursor: pointer;
  transition: color .25s ease;

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

  &:hover::after { transform: scaleX(1); }

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
  border: 1px solid var(--kbts-border);
  background: white;
  color: var(--kbts-fg);
  padding: .45rem .75rem;
  font: inherit;
  cursor: pointer;
  transition: background .2s ease, color .2s ease;

  &:hover {
    background: var(--kbts-fg);
    color: var(--kbts-bg);
  }
}

@media (max-width: 768px) {
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
    padding: 2rem;
    overflow-y: auto;

    &.open {
      display: flex;
      justify-content: flex-start;
    }
  }

  :global(.portal-navigation nav) { top: var(--kbts-nav-height); }

  .nav-primary,
  .nav-secondary {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .nav-secondary { margin-left: 0; }

  .nav-primary > a {
    padding: 1rem .75rem;
    font-size: 1.2rem;
    text-align: left;
    border-radius: 6px;

    &::after { display: none; }
    &:hover,
    &:focus-visible { background: rgba(0, 0, 0, .05); }
  }
}
</style>
