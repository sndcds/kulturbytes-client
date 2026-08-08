<script setup lang="ts">
import deHtml from '../assets/legal/de.html?raw'
import enHtml from '../assets/legal/en.html?raw'
import daHtml from '../assets/legal/da.html?raw'

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
  title: computed(() => t('nav.legal'))
})

</script>

<template>
  <article class="kbts-html legal-page" v-html="pageHtml" />
</template>