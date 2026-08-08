<script setup lang="ts">
import deHtml from '../assets/terms/de.html?raw'
import enHtml from '../assets/terms/en.html?raw'
import daHtml from '../assets/terms/da.html?raw'

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
  title: computed(() => t('nav.terms'))
})
</script>

<template>
  <article class="kbts-html terms-page" v-html="pageHtml" />
</template>