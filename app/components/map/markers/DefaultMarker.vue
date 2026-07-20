<template>
  <div
      class="marker"
      :title="feature.properties.name"
  >
    <img
        class="marker__icon"
        :src="markerIcon"
        alt=""
    />
  </div>
</template>


<script setup lang="ts">
import type { Feature, Point } from 'geojson'
import markerIcon from '~/assets/map/markers/cultural-center.png'

interface VenueProperties {
  uuid:string
  name:string
  city?:string|null
  country?:string|null
  type?:string|null
  marker_style?:string|null
  logo_uuid?:string|null
}

defineProps<{
  feature:Feature<Point, VenueProperties>
}>()
</script>


<style scoped>
.marker {
  position: relative; /* important */
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  z-index: 1000;
}

.marker__icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
</style>