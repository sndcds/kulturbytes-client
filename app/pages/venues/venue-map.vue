<template>
  <VenueMap class="venues-map" />
</template>


<script setup lang="ts">
import VenueMap from '~/components/venue/VenueMap.client.vue'

definePageMeta({
  layout: 'map'
})
</script>


<style scoped>
.venues-map {
  width: 100%;
  height: 100%;
}
</style>