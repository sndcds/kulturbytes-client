<template>
  <div
      ref="container"
      class="map-container"
      :style="{ height }"
  />
</template>

<script setup lang="ts">
import { useMapLibre } from '~/composables/useMapLibre'

import type { MapLayerConfig } from '~/composables/useMapLibreLayers'
import type { LngLatLike } from 'maplibre-gl'

interface Props {
  layers: Record<string, MapLayerConfig>
  center?: LngLatLike
  zoom?: number
  enablePopups?: boolean
  styleLight?: string
  styleDark?: string
  height?: string
}

const props = withDefaults(
    defineProps<Props>(),
    {
      enablePopups: true,
      styleLight: '/versatiles/versatiles-style.json',
      styleDark: '/versatiles/versatiles-dark-style.json',
      height: '300px'
    }
)

const emit = defineEmits<{
  mapLoaded: [map: any]
}>()


const {
  container,
  map
} = useMapLibre(
    props,
    (map) => emit('mapLoaded', map)
)
</script>


<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>