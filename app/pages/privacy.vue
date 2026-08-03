<script setup lang="ts">
import deHtml from '../assets/privacy/de.html?raw'
import enHtml from '../assets/privacy/en.html?raw'
import daHtml from '../assets/privacy/da.html?raw'

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
  <article class="kbts-html privacy-page" v-html="pageHtml" />
</template>