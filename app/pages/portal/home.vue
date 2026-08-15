<template>
  <section class="portal-home">
    <h1>Portal Home</h1>
    <p>Portal UUID: {{ portalUuid || 'none' }}</p>
  </section>
</template>

<script setup lang="ts">
import { useFiltersStore } from '~/stores/filtersStore'

const filtersStore = useFiltersStore()

const portalUuid = computed(() => filtersStore.eventPortalUuid)

definePageMeta({
  filters: false,
})
</script>

<style scoped lang="scss">
.portal-home {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
