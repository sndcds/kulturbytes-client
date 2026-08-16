<template>
  <section class="portal-info">
    <h1>{{ activePortal?.name }}</h1>
  </section>
</template>

<script setup lang="ts">
defineI18nRoute({
  paths: {
    de: '/portal/[portal_identifier]/info',
    da: '/portal/[portal_identifier]/info',
    en: '/portal/[portal_identifier]/info'
  }
})

definePageMeta({
  filters: false,
})

const route = useRoute()
const { activePortal, activatePortal } = usePortal()

const portalIdentifier = computed(() => {
  const value = route.params.portal_identifier
  return Array.isArray(value) ? value[0] ?? '' : value?.toString() ?? ''
})

await activatePortal(portalIdentifier.value)

watch(portalIdentifier, async (identifier) => {
  await activatePortal(identifier)
})

useHead(() => ({
  title: activePortal.value?.name ?? 'Portal'
}))
</script>

<style scoped lang="scss">
.portal-info {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
