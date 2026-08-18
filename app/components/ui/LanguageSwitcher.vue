<template>
  <div
    ref="switcher"
    class="language-switcher"
    :class="`language-switcher--${variant}`"
  >
    <button
        type="button"
        class="language-button"
        :aria-label="t('nav.language')"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="open = !open"
        @keydown.esc="close"
    >
      <Settings :size="20" aria-hidden="true" />
      <span class="current-language">{{ currentLocale.toUpperCase() }}</span>
    </button>

    <div v-if="open" class="language-menu" role="menu">
      <NuxtLink
          v-for="language in availableLanguages"
          :key="language.code"
          :to="switchLocalePath(language.code)"
          :class="{ active: language.code === currentLocale }"
          role="menuitem"
          :lang="language.code"
          @click="close"
      >
        <span>{{ language.code.toUpperCase() }}</span>
        <span class="language-name">{{ language.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from '@lucide/vue'

withDefaults(defineProps<{
  variant?: 'desktop' | 'mobile-navigation'
}>(), {
  variant: 'desktop',
})

const { t, locale: currentLocale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const switcher = ref<HTMLElement | null>(null)
const open = ref(false)
const supportedLanguages = ['de', 'da', 'en'] as const

const availableLanguages = computed(() => supportedLanguages.map((code) => {
  const locale = locales.value.find(locale => locale.code === code)

  return {
    code,
    name: locale?.name ?? code.toUpperCase(),
  }
}))

function close() {
  open.value = false
}

function closeOnOutsideClick(event: MouseEvent) {
  if (
      open.value
      && event.target instanceof Node
      && !switcher.value?.contains(event.target)
  ) {
    close()
  }
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))
</script>

<style scoped lang="scss">
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: .35rem;
  padding: .45rem .55rem;
  border: 0;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;
  cursor: pointer;
}

.current-language {
  font-size: .8rem;
  font-weight: 600;
}

.language-menu {
  position: absolute;
  z-index: 10;
  top: calc(100% + .5rem);
  right: 0;
  min-width: 140px;
  padding: .35rem;
  display: flex;
  flex-direction: column;
  background: var(--kbts-bg);
  border: 1px solid var(--kbts-border);
  border-radius: 8px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, .12);

  a {
    display: flex;
    align-items: center;
    gap: .65rem;
    padding: .55rem .65rem;
    color: var(--kbts-fg);
    border-radius: 6px;
    text-decoration: none;
    font-size: .9rem;

    &:hover,
    &:focus-visible {
      background: rgba(0, 0, 0, .06);
    }

    &.active {
      font-weight: 700;
    }
  }
}

.language-name {
  color: var(--kbts-muted-fg);
  font-weight: 400;
}

.language-switcher--mobile-navigation {
  min-width: 0;

  .language-button {
    width: 100%;
    height: 100%;
    min-height: var(--kbts-mobile-nav-height);
    padding: .5rem .25rem;
    flex-direction: column;
    justify-content: center;
    gap: .2rem;
    color: var(--kbts-muted-fg);
    font-size: .72rem;

    &:hover,
    &:focus-visible,
    &[aria-expanded="true"] {
      color: var(--kbts-fg);
    }
  }

  .current-language {
    font-size: .72rem;
  }

  .language-menu {
    top: auto;
    right: .25rem;
    bottom: calc(100% + .5rem);
  }
}
</style>
