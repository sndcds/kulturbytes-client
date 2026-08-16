<template>
  <div />
</template>

<script setup lang="ts">
defineI18nRoute({
  paths: {
    de: '/portal/[portal_identifier]',
    da: '/portal/[portal_identifier]',
    en: '/portal/[portal_identifier]'
  }
})

const route = useRoute()
const localePath = useLocalePath()
const value = route.params.portal_identifier
const portalIdentifier = Array.isArray(value) ? value[0] ?? '' : value?.toString() ?? ''

await navigateTo(
    localePath(`/portal/${portalIdentifier}/events`),
    { redirectCode: 301, replace: true }
)
</script>
