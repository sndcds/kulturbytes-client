<template>

  <!--
    org.logos.main: {{ JSON.stringify(org.logos.main, null, 2) }}<br><br>
    org.logos.light: {{ JSON.stringify(org.logos.light, null, 2) }}<br><br>
    org.logos.dark: {{ JSON.stringify(org.logos.dark, null, 2) }}<br><br>
    themeStore.theme: {{ JSON.stringify(themeStore.theme, null, 2) }}<br><br>
    org.url: {{ JSON.stringify(org.url, null, 2) }}
  -->

  <LogoImage
      v-if="org.hasLogo"
      class="kbts-event-view-logo-image"
      :main-src="org.logos.main"
      :light-src="org.logos.light"
      :dark-src="org.logos.dark"
      :theme="themeStore.theme"
      :link-url="org.url"
      :pixel-count="120 * 80"
      :max-width="240"
      :max-height="120"
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
    main: eventOrg.value.logos?.main_logo?.url ?? null,
    light: eventOrg.value.logos?.light_theme_logo?.url ?? null,
    dark: eventOrg.value.logos?.dark_theme_logo?.url ?? null,
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