<script setup lang="ts">
import EventFiltersMobile from './EventFiltersMobile.vue'
import EventFiltersDesktop from './EventFiltersDesktop.vue'

const { isMobile } = useMobileViewport()
const emit = defineEmits<{ close: [], show: [] }>()
</script>

<template>
  <EventFiltersMobile v-if="isMobile === true" @close="emit('close')" @show="emit('show')" />
  <EventFiltersDesktop v-else-if="isMobile === false" @close="emit('close')" />
</template>
