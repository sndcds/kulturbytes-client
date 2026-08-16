<template>
  <NuxtLayout>
    <NuxtPage :keepalive="{ max: 10 }" />
  </NuxtLayout>
</template>
<script setup lang="ts">
const { initializePortal } = usePortal()
const route = useRoute()
const routePortalIdentifier = computed(() => {
  const value = route.params.portal_identifier
  return Array.isArray(value) ? value[0] : value?.toString()
})

await initializePortal(routePortalIdentifier.value)
</script>
