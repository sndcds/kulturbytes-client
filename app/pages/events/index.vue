<script setup lang="ts">
const localePath = useLocalePath()

defineI18nRoute({
  paths: {
    de: '/veranstaltungen',
    da: '/begivenheder',
    en: '/events'
  }
})

await navigateTo(localePath('index'), {
  redirectCode: 301
})
</script>

<template />