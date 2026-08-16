<template>
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

    <div class="info-menu info-menu-desktop" role="menu">
      <NuxtLink :to="localePath('about')" role="menuitem" @click="closeMenus">{{ t('nav.about') }}</NuxtLink>
      <NuxtLink :to="localePath('/privacy')" role="menuitem" @click="closeMenus">{{ t('nav.privacy') }}</NuxtLink>
      <NuxtLink :to="localePath('/terms')" role="menuitem" @click="closeMenus">{{ t('nav.terms') }}</NuxtLink>
      <NuxtLink :to="localePath('/legal')" role="menuitem" @click="closeMenus">{{ t('nav.legal') }}</NuxtLink>
    </div>

    <div class="info-menu-mobile">
      <NuxtLink :to="localePath('about')" @click="closeMenus">{{ t('nav.about') }}</NuxtLink>
      <NuxtLink :to="localePath('/privacy')" @click="closeMenus">{{ t('nav.privacy') }}</NuxtLink>
      <NuxtLink :to="localePath('/terms')" @click="closeMenus">{{ t('nav.terms') }}</NuxtLink>
      <NuxtLink :to="localePath('/legal')" @click="closeMenus">{{ t('nav.legal') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  opened: []
  navigate: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const infoOpen = ref(false)
const infoNav = ref<HTMLElement | null>(null)
const isMobileNavigation = ref(false)
const infoMenuVisible = computed(() => isMobileNavigation.value || infoOpen.value)

function openInfoMenu() {
  if (!isMobileNavigation.value) {
    infoOpen.value = true
    emit('opened')
  }
}

function closeInfoMenu() {
  if (!isMobileNavigation.value) infoOpen.value = false
}

function toggleInfoMenu() {
  if (!isMobileNavigation.value) {
    infoOpen.value = !infoOpen.value
    if (infoOpen.value) emit('opened')
  }
}

function closeInfoMenuIfUnfocused() {
  if (isMobileNavigation.value) return

  requestAnimationFrame(() => {
    if (!infoNav.value?.contains(document.activeElement)) infoOpen.value = false
  })
}

function closeInfoMenuOnOutsideClick(event: MouseEvent) {
  if (
    !isMobileNavigation.value
    && infoOpen.value
    && infoNav.value
    && event.target instanceof Node
    && !infoNav.value.contains(event.target)
  ) {
    infoOpen.value = false
  }
}

function updateNavigationMode() {
  isMobileNavigation.value = window.matchMedia('(max-width: 768px)').matches
}

function closeMenus() {
  infoOpen.value = false
  emit('navigate')
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

defineExpose({ closeInfoMenu })
</script>

<style scoped lang="scss">
.info-nav { position: relative; }

.info-button {
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
}

.info-menu-mobile { display: none; }

.info-menu {
  position: absolute;
  top: 100%;
  min-width: 180px;
  padding: .5rem;
  display: flex;
  flex-direction: column;
  gap: .1rem;
  background: var(--kbts-bg);
  border: 1px solid var(--kbts-border);
  border-radius: 8px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, .12);
  opacity: 0;
  pointer-events: none;
  transform: translate(0, -.25rem);
  transition: opacity .18s ease, transform .18s ease;

  a {
    padding: .65rem .75rem;
    color: var(--kbts-fg);
    text-decoration: none;
    font-weight: 400;
    border-radius: 6px;
    white-space: nowrap;
    transition: background .18s ease;

    &:hover,
    &:focus-visible { background: rgba(0, 0, 0, .06); }
    &.router-link-active { font-weight: 700; }
  }
}

.info-nav.open .info-menu {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .info-nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .info-button {
    padding: 1rem .75rem;
    font-size: 1.2rem;
    text-align: left;
    border-radius: 6px;

    &::after { display: none; }
    &:hover,
    &:focus-visible { background: rgba(0, 0, 0, .05); }
  }

  .info-menu-desktop { display: none; }

  .info-menu-mobile {
    padding: 0 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0;

    a {
      padding: .45rem .75rem;
      font-size: 1.05rem;
      color: var(--kbts-fg);
      border-radius: .25rem;

      &:hover,
      &:focus-visible { background: rgba(0, 0, 0, .04); }
      &.router-link-active {
        font-weight: 700;
        color: var(--kbts-fg);
      }
    }
  }
}
</style>
