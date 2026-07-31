<template>
  <MapLibreMap
      class="venues-map"
      :center="center"
      :zoom="zoom"
      :bearing="bearing"
      :pitch="pitch"
      :height="height"
      :fade-duration="0"
      @map-loaded="onMapLoaded"
  />
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Map as MapLibreMapType } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import MapLibreMap from '~/components/map/MapLibreMap.client.vue'
import {
  useMapLibreLayers,
  type MapLayerConfig
} from '~/composables/useMapLibreLayers'
import VenuePopup from '~/components/venue/VenuePopup.vue'
import { useMapsStore } from '~/stores/mapsStore'

const props =
    withDefaults(
        defineProps<{
          center?:[number,number]
          zoom?:number
          height?:string
        }>(),
        {
          center:() => [9.5, 54.3],
          zoom:8,
          height:'500px'
        })

const venues =
    ref<FeatureCollection>({
      type:'FeatureCollection',
      features:[]
    })

const layers = computed<Record<string, MapLayerConfig>>(() => ({
  venues: {
    data: venues.value,

    cluster: true,

    iconProperty:'marker_style',

    icons: {
      default: '/map/markers/default.png',
      "cultural_place": '/map/markers/cultural-place.png',
      "outdoor_area": '/map/markers/outdoor-area.png',
      "public_place": '/map/markers/public-place.png',
      "sacred_space": '/map/markers/sacred-space.png',
      "city_district": '/map/markers/city-district.png',
      "museum": '/map/markers/museum.png',
      "education": '/map/markers/education.png',
    },

    clusterStyle: {
      circleColor: '#ffffff',
      circleRadius: 16,
      circleStrokeWidth: 2,
      circleStrokeColor:' #243f6e',
      textSize: 14,
      textColor: '#243f6e'
    },

    unclusteredStyle: {
      iconSize: 2,
      iconAnchor: 'bottom',
      iconAllowOverlap: true,
      iconIgnorePlacement:true
    },

    label: {
      field: 'name',
      textSize: 12,
      textOffset: [0, 0.5],
      textAnchor: 'top',
      textColor: '#243f6e',
      allowOverlap: false
    },

    popupStyle: {
      className: 'venue-popup',
      maxWidth: '350px',
      offset: [0, -22]
    },

    popupComponent: VenuePopup,
  }
}))

const maplibregl =
    await import('maplibre-gl')
        .then(
            m => m.default ?? m
        )

const {
  initializeLayers,
  updateSources
} = useMapLibreLayers
(
    {
      get layers() {
        return layers.value
      }
    } as any, maplibregl
)

const mapsStore = useMapsStore()
const center = computed(() => mapsStore.venueMap.center ?? props.center)
const zoom = computed(() => mapsStore.venueMap.zoom ?? props.zoom)
const bearing = computed(() => mapsStore.venueMap.bearing ?? 0)
const pitch = computed(() => mapsStore.venueMap.pitch ?? 0)
const height = props.height

async function onMapLoaded(map:MapLibreMapType) {
  await initializeLayers(map)
  await loadVenues(map)
  map.on(
      'moveend',
      () => {
        saveMapView(map)
        loadVenues(map)
      }
  )
  map.on('rotateend', () => saveMapView(map))
  map.on('pitchend', () => saveMapView(map))
}

function saveMapView(map: MapLibreMapType) {
  const mapCenter = map.getCenter()

  mapsStore.setVenueMapView({
    center: [
      mapCenter.lng,
      mapCenter.lat,
    ],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  })
}

async function loadVenues(map: MapLibreMapType) {
  const bounds = map.getBounds()

  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',')

  const { $api } = useNuxtApp()

  try {
    const response = await $api<any>('/api/venues/geojson', { query: { bbox } })
    venues.value = response.data ?? response
    updateSources(map, layers.value)
  } catch (error) {
    console.error('Failed loading venues:', error)
  }
}
</script>


<style scoped>
.venues-map{
  width:100%;
  height:100%;
  min-height:400px;
}
</style>
