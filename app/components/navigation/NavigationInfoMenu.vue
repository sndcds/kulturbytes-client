<template>
  <div
    ref="infoNav"
    class="info-nav"
    :class="[`info-nav--${variant}`, { open: infoOpen, active: infoRouteActive }]"
    @mouseenter="variant === 'desktop' && openInfoMenu()"
    @mouseleave="variant === 'desktop' && closeInfoMenuIfUnfocused()"
    @focusin="variant === 'desktop' && openInfoMenu()"
    @focusout="variant === 'desktop' && closeInfoMenuIfUnfocused()"
  >
    <button
      type="button"
      class="info-button"
      aria-haspopup="menu"
      :aria-expanded="infoOpen"
      :aria-current="infoRouteActive ? 'page' : undefined"
      @click="toggleInfoMenu"
      @keydown.esc="closeInfoMenu"
    >
      <Info v-if="variant === 'mobile'" :size="21" aria-hidden="true" />
      <span>{{ t('nav.info') }}</span>
    </button>

    <div v-show="infoOpen" class="info-menu" role="menu">
      <NuxtLink :to="localePath('about')" role="menuitem" @click="closeMenus">
        {{ t('nav.about') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/privacy')" role="menuitem" @click="closeMenus">
        {{ t('nav.privacy') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/terms')" role="menuitem" @click="closeMenus">
        {{ t('nav.terms') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/legal')" role="menuitem" @click="closeMenus">
        {{ t('nav.legal') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info } from '@lucide/vue'

defineProps<{
  variant: 'desktop' | 'mobile'
}>()

const emit = defineEmits<{
  opened: []
  navigate: []
}>()

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const infoOpen = ref(false)
const infoNav = ref<HTMLElement | null>(null)
const infoRoutes = computed(() => [
  localePath('about'),
  localePath('/privacy'),
  localePath('/terms'),
  localePath('/legal'),
])
const infoRouteActive = computed(() => infoRoutes.value.includes(route.path))

function openInfoMenu() {
  if (infoOpen.value) return

  infoOpen.value = true
  emit('opened')
}

function closeInfoMenu() {
  infoOpen.value = false
}

function toggleInfoMenu() {
  infoOpen.value ? closeInfoMenu() : openInfoMenu()
}

function closeInfoMenuIfUnfocused() {
  requestAnimationFrame(() => {
    if (!infoNav.value?.contains(document.activeElement)) closeInfoMenu()
  })
}

function closeInfoMenuOnOutsideClick(event: MouseEvent) {
  if (
    infoOpen.value
    && infoNav.value
    && event.target instanceof Node
    && !infoNav.value.contains(event.target)
  ) {
    closeInfoMenu()
  }
}

function closeMenus() {
  closeInfoMenu()
  emit('navigate')
}

watch(() => route.path, closeInfoMenu)
onMounted(() => document.addEventListener('click', closeInfoMenuOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeInfoMenuOnOutsideClick))

defineExpose({ closeInfoMenu })
</script>

<style scoped lang="scss">
.info-nav {
  position: relative;
}

.info-button {
  border: 0;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;
  cursor: pointer;
}

.info-nav--desktop .info-button {
  position: relative;
  padding: .25rem;
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
  &:focus-visible::after,
  &[aria-expanded="true"]::after,
  &[aria-current="page"]::after {
    transform: scaleX(1);
  }

  &[aria-current="page"] {
    font-weight: 700;
  }
}

.info-menu {
  position: absolute;
  z-index: 120;
  min-width: 180px;
  padding: .5rem;
  display: flex;
  flex-direction: column;
  gap: .1rem;
  background: var(--kbts-bg);
  border: 1px solid var(--kbts-border);
  border-radius: 8px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, .12);

  a {
    padding: .65rem .75rem;
    color: var(--kbts-fg);
    text-decoration: none;
    font-weight: 400;
    border-radius: 6px;
    white-space: nowrap;

    &:hover,
    &:focus-visible {
      background: var(--kbts-card-bg);
    }

    &.router-link-active {
      font-weight: 700;
    }
  }
}

.info-nav--desktop .info-menu {
  top: calc(100% + .65rem);
  left: 0;
}

.info-nav--mobile {
  min-width: 0;
}

.info-nav--mobile .info-button {
  width: 100%;
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

  &:hover,
  &:focus-visible,
  &[aria-expanded="true"],
  &[aria-current="page"] {
    color: var(--kbts-fg);
  }

  &[aria-current="page"] {
    font-weight: 700;
    box-shadow: inset 0 2px var(--kbts-fg);
  }
}

.info-nav--mobile .info-menu {
  right: .25rem;
  bottom: calc(100% + .5rem);
}
</style>
