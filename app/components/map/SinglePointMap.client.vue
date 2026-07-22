<template>

  <MapLibreMap
      class="map-container"
      :center="[lon,lat]"
      :zoom="zoom"
      :height="height"
      @map-loaded="onMapLoaded"
  />

</template>


<script setup lang="ts">
import { computed } from 'vue'
import type { Map as MapLibreMapType } from 'maplibre-gl'
import type { FeatureCollection, Point } from 'geojson'
import MapLibreMap from '~/components/map/MapLibreMap.client.vue'
import { useMapLibreLayers } from '~/composables/useMapLibreLayers'

const props =
    withDefaults(
        defineProps<{
          lat:number
          lon:number
          name?:string
          zoom?:number
          height?:string
        }>(),
        {
          zoom:14,
          height:'300px'
        }
    )

const zoom = computed(() => props.zoom)

const layers = computed(() => ({
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
                name: props.name ?? ''
              }
            }
          ]
        } as FeatureCollection<Point>,

        cluster: false,
        icons:{
          default: '/map/markers/cultural-place.png'
        },

        iconProperty: 'marker_style',

        properties:{
          name: props.name ?? '',
          marker_style:'default'
        },

        unclusteredStyle: {
          iconSize: 2,
          iconAnchor: 'bottom',
          iconAllowOverlap: true,
          iconIgnorePlacement: true
        },

        popupTitle(feature:any){
          return String(feature.properties?.name ?? '')
        }
      }
    })
)

const { initializeLayers } = useMapLibreLayers({
  get layers() {
    return layers.value
  }
} as any)


async function onMapLoaded(map:MapLibreMapType) {
  await initializeLayers(map)
}
</script>


<style scoped>
.map-container {
  width:100%;
  height:100%;
}
</style>