<script setup lang="ts">
const localePath = useLocalePath()

await navigateTo(localePath('index'), {
  redirectCode: 301
})
</script>

<template />