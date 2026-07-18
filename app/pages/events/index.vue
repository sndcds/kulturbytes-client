<template>
  <EventsView />
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from "~/stores/filtersStore";

const { setFilter } = useFiltersStore()

setFilter('events')

onUnmounted(() => {
  setFilter(null)
})

definePageMeta({
  filters: true
})
</script>