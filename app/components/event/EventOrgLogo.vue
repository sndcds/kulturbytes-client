<template>
  <LogoImage
      v-if="org.hasLogo"
      class="kbts-event-view-logo-image"
      :logo-url="org.logos.main"
      :light-theme-logo-url="org.logos.light"
      :dark-theme-logo-url="org.logos.dark"
      :theme="themeStore.theme"
      :pixel-count="120 * 80"
      :max-width="240"
      :max-height="120"
      :link-url="org.url"
      link-target="_blank"
  />

</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/themeStore'
import { ensureHttpOrHttps } from '@/utils/url'

interface EventOrgLogo {
  uuid: string
  url: string
}

interface EventOrg {
  name?: string | null
  webLink?: string | null
  logos?: Record<string, EventOrgLogo>
}

const props = defineProps<{
  eventOrg: EventOrg
}>()

const { eventOrg } = toRefs(props)

const { t } = useI18n()
const themeStore = useThemeStore()

const org = computed(() => {
  const logos = {
    main: eventOrg.value.logos?.main_logo?.url ?? '',
    light: eventOrg.value.logos?.light_theme_logo?.url ?? '',
    dark: eventOrg.value.logos?.dark_theme_logo?.url ?? '',
  }

  return {
    name: eventOrg.value.name,
    url: eventOrg.value.webLink
        ? ensureHttpOrHttps(eventOrg.value.webLink)
        : null,
    logos,
    hasLogo: Object.values(logos).some(Boolean),
  }
})
</script>