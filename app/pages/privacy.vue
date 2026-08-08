<script setup lang="ts">
import deHtml from '../assets/privacy/de.html?raw'
import enHtml from '../assets/privacy/en.html?raw'
import daHtml from '../assets/privacy/da.html?raw'

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
  title: computed(() => t('nav.privacy'))
})
</script>

<template>
  <article class="kbts-html privacy-page" v-html="pageHtml" />
</template>