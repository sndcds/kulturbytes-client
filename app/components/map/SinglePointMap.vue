<template>
  <MapLibreMap
      class="map-container"
      :layers="mapLayers"
      :center="[props.lon, props.lat]"
      :zoom="zoom"
      :height="height"
      :enable-popups="false"
  />
</template>


<script setup lang="ts">
import { computed } from 'vue'
import type { FeatureCollection, Point } from 'geojson'

import MapLibreMap from '~/components/map/MapLibreMap.vue'
import venueIcon from '~/assets/map/marker.png'

import type { MapLayerConfig } from '~/composables/useMapLibreLayers'

const props = defineProps<{
  id?: string
  lat: number
  lon: number
  name?: string
  zoom?: number
  height?: string
}>()

const zoom = computed(
    () => props.zoom ?? 14
)

const mapLayers = computed<
    Record<string, MapLayerConfig>
>(() => ({

  venue: {

    data: {
      type: 'FeatureCollection',

      features: [
        {
          type: 'Feature',

          geometry: {
            type: 'Point',

            coordinates: [
              props.lon,
              props.lat
            ]
          },

          properties: {
            name:
                props.name ?? ''
          }
        }
      ]

    } as FeatureCollection<Point>,


    cluster: false,

    icon: venueIcon,

    unclusteredStyle: {
      iconSize: 1,
      iconAnchor: 'bottom',
      iconAllowOverlap: true,
      iconIgnorePlacement: true
    },

    popupTitle: (
        feature
    ) =>
        String(
            feature.properties?.name ?? ''
        )
  }

}))
</script>


<style scoped>

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

</style>