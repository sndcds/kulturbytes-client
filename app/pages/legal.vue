<script setup lang="ts">
import deHtml from '../assets/legal/de.html?raw'
import enHtml from '../assets/legal/en.html?raw'
import daHtml from '../assets/legal/da.html?raw'

definePageMeta({
  layout: 'default'
})

const { locale } = useI18n()

const htmlByLocale = {
  de: deHtml,
  en: enHtml,
  da: daHtml
}

const pageHtml = computed(() => htmlByLocale[locale.value] ?? enHtml)
</script>

<template>
  <article class="kbts-html legal-page" v-html="pageHtml" />
</template>