<script setup lang="ts">
import deHtml from '../assets/terms/de.html?raw'
import enHtml from '../assets/terms/en.html?raw'
import daHtml from '../assets/terms/da.html?raw'

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
  <article class="kbts-html terms-page" v-html="pageHtml" />
</template>