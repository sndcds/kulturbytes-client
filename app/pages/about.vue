<script setup lang="ts">
import AboutDe from '~/components/about/AboutDe.vue'
import AboutDa from '~/components/about/AboutDa.vue'
import AboutEn from '~/components/about/AboutEn.vue'

const { locale } = useI18n()
</script>

<template>
  <AboutDe v-if="locale === 'de'" />
  <AboutDa v-else-if="locale === 'da'" />
  <AboutEn v-else />
</template>
