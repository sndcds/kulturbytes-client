<script setup lang="ts">
import deHtml from '../assets/about/de.html?raw'
import enHtml from '../assets/about/en.html?raw'
import daHtml from '../assets/about/da.html?raw'

const { locale, t } = useI18n()

const htmlByLocale = {
  de: deHtml,
  en: enHtml,
  da: daHtml
}

const pageHtml = computed(() => htmlByLocale[locale.value] ?? enHtml)

definePageMeta({
  layout: 'default'
})

useHead({
  title: computed(() => t('nav.about'))
})
</script>

<template>
  <article class="kbts-html about-page" v-html="pageHtml" />
</template>