<template>
  <EventsView />
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from "~/stores/filtersStore";

const { setFilter } = useFiltersStore()
setFilter('events')

defineI18nRoute({
  paths: {
    de: '/veranstaltungen',
    da: '/begivenheder',
    en: '/events'
  }
})

definePageMeta({
  filters: true
})

onUnmounted(() => {
  setFilter(null)
})
</script>