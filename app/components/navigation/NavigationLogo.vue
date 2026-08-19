<template>
  <NuxtLink :to="logoLink" class="logo" :aria-label="t('logo_label')">
    <AppLogo v-if="!isPortalActive" />
    <img
      v-else-if="portalLogoUrl"
      class="portal-logo-image"
      :src="portalLogoUrl"
      :alt="activePortal?.name || 'Portal'"
    />
    <Building2 v-else class="portal-logo" :size="32" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { Building2 } from '@lucide/vue'
import AppLogo from '~/components/ui/AppLogo.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const filtersStore = useFiltersStore()
const { activePortal } = usePortal()

const isPortalActive = computed(() =>
  Boolean(filtersStore.eventPortalIdentifier)
)

const portalLogoUrl = computed(() => {
  const url = activePortal.value?.web_logo_url
  return url ? `${url}?type=png` : null
})

const logoLink = computed(() => {
  const portalIdentifier = filtersStore.eventPortalIdentifier

  return portalIdentifier
    ? localePath(`/portal/${portalIdentifier}`)
    : localePath('/')
})
</script>

<style scoped lang="scss">
.logo {
  display: flex;
  align-items: center;
  color: var(--kbts-fg);
  text-decoration: none;
}

:global(.portal-navigation .logo) {
  align-self: flex-start;
  height: calc(
    var(--kbts-nav-height)
    - var(--kbts-logo-top-margin)
    - var(--kbts-logo-bottom-margin)
  );
  margin-top: var(--kbts-logo-top-margin);
  margin-bottom: var(--kbts-logo-bottom-margin);
}

.portal-logo {
  display: block;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: var(--kbts-fg);
}

.portal-logo-image {
  display: block;
  width: auto;
  height: auto;
  max-height: 40px;
  object-fit: contain;
}

:global(.portal-navigation .portal-logo-image) {
  height: 100%;
  max-height: none;
}

:global(.portal-navigation .portal-logo) {
  width: auto;
  height: 100%;
}
</style>
