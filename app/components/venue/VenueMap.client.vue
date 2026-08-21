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
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import type { Map as MapLibreMapType } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import MapLibreMap from '~/components/map/MapLibreMap.client.vue'
import {
  useMapLibreLayers,
  type MapLayerConfig,
} from '~/composables/useMapLibreLayers'
import VenuePopup from '~/components/venue/VenuePopup.vue'
import { useMapsStore } from '~/stores/mapsStore'
import { useFiltersStore } from '~/stores/filtersStore'
import type { ApiResponse } from '~/types/api'
import type { VenueFeature, VenueProperties } from '~/types/mapMarkers'
import type { PortalBoundaryFeature } from '~/types/portal'

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

const markerStyleByVenueType: Record<string, string> = {
  art_gallery: 'cultural_place',
  beach: 'public_area',
  castle: 'historic_site',
  cultural_center: 'cultural_place',
  educational_institution: 'education',
  event_house: 'cultural_place',
  exhibition_hall: 'cultural_place',
  library: 'education',
  museum: 'museum',
  music_school: 'education',
  outdoor_area: 'outdoor_area',
  park: 'public_area',
  playground: 'small_place',
  public_place: 'public_place',
  sacred_space: 'sacred_space',
  theatre: 'cultural_place',
  youth_center: 'cultural_place',
}

function normalizeVenueMarkers(collection: FeatureCollection): FeatureCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const properties = feature.properties as VenueProperties | null

      if (!properties || properties.marker_style || !properties.type) {
        return feature
      }

      return {
        ...feature,
        properties: {
          ...properties,
          marker_style: markerStyleByVenueType[properties.type] ?? 'default',
        },
      } as VenueFeature
    }),
  }
}

const layers = computed<Record<string, MapLayerConfig>>(() => ({
  venues: {
    data: venues.value,
    cluster: true,
    iconProperty:'marker_style',

    icons: {
      default: '/map/markers/default.png',
      "cultural_place": '/map/markers/cultural-place.png',
      "outdoor_area": '/map/markers/outdoor-area.png',
      "public_area": '/map/markers/public-place.png',
      "public_place": '/map/markers/public-place.png',
      "sacred_space": '/map/markers/sacred-space.png',
      "city_district": '/map/markers/city-district.png',
      "historic_site": '/map/markers/cultural-place.png',
      "small_place": '/map/markers/outdoor-area.png',
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
  updateSources,
  addPortalBoundary,
  removePortalBoundary,
} = useMapLibreLayers
(
    {
      get layers() {
        return layers.value
      }
    } as any, maplibregl
)

const mapsStore = useMapsStore()
const filtersStore = useFiltersStore()
const { activePortal } = usePortal()
const activePortalUuid = computed(
    () => activePortal.value?.uuid ?? filtersStore.eventPortalUuid
)
const center = computed(() => mapsStore.venueMap.center ?? props.center)
const zoom = computed(() => mapsStore.venueMap.zoom ?? props.zoom)
const bearing = computed(() => mapsStore.venueMap.bearing ?? 0)
const pitch = computed(() => mapsStore.venueMap.pitch ?? 0)
const height = props.height

let mapInstance: MapLibreMapType | null = null
let boundaryRequest: AbortController | null = null
let boundaryRequestVersion = 0
const boundaryCache = new Map<string, PortalBoundaryFeature>()

function isPortalBoundaryFeature(value: unknown): value is PortalBoundaryFeature {
  if (!value || typeof value !== 'object') {
    return false
  }

  const feature = value as Record<string, unknown>
  const pointGeometry = feature.point

  if (!pointGeometry || typeof pointGeometry !== 'object') {
    return false
  }

  const candidateGeometry = pointGeometry as Record<string, unknown>
  const coordinates = candidateGeometry.coordinates
  const isPosition = (position: unknown) => Array.isArray(position)
      && position.length >= 2
      && position.every(
          coordinate => typeof coordinate === 'number'
              && Number.isFinite(coordinate)
      )
  const isRing = (ring: unknown) => Array.isArray(ring)
      && ring.length >= 4
      && ring.every(isPosition)
  const isPolygon = (polygon: unknown) => Array.isArray(polygon)
      && polygon.length > 0
      && polygon.every(isRing)

  return feature.type === 'Feature'
      && (
        (candidateGeometry.type === 'Polygon' && isPolygon(coordinates))
        || (
          candidateGeometry.type === 'MultiPolygon'
          && Array.isArray(coordinates)
          && coordinates.length > 0
          && coordinates.every(isPolygon)
        )
      )
}

function firstVenueLayerId(map: MapLibreMapType): string | undefined {
  return [
    'venues-clusters',
    'venues-cluster-count',
    'venues-unclustered',
    'venues-labels',
  ].find(layerId => !!map.getLayer(layerId))
}

function displayPortalBoundary(
    map: MapLibreMapType,
    feature: PortalBoundaryFeature
) {
  try {
    addPortalBoundary(map, feature, firstVenueLayerId(map))
  } catch (error) {
    console.error('Failed displaying portal boundary:', error)
  }
}

async function syncPortalBoundary(portalUuid: string | null) {
  const map = mapInstance

  boundaryRequestVersion += 1
  const requestVersion = boundaryRequestVersion
  boundaryRequest?.abort()
  boundaryRequest = null

  if (!map) {
    return
  }

  removePortalBoundary(map)

  if (!portalUuid) {
    return
  }

  const cachedBoundary = boundaryCache.get(portalUuid)
  if (cachedBoundary) {
    displayPortalBoundary(map, cachedBoundary)
    return
  }

  const controller = new AbortController()
  boundaryRequest = controller
  const { $api } = useNuxtApp()

  try {
    const response = await $api<ApiResponse<unknown>>(
        `/api/portal/${encodeURIComponent(portalUuid)}/geojson`,
        { signal: controller.signal }
    )

    if (!isPortalBoundaryFeature(response.data)) {
      console.error('Portal boundary response contains invalid GeoJSON')
      return
    }

    boundaryCache.set(portalUuid, response.data)

    if (
        controller.signal.aborted
        || requestVersion !== boundaryRequestVersion
        || activePortalUuid.value !== portalUuid
        || mapInstance !== map
    ) {
      return
    }

    displayPortalBoundary(map, response.data)
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error('Failed loading portal boundary:', error)
    }
  } finally {
    if (boundaryRequest === controller) {
      boundaryRequest = null
    }
  }
}

async function onMapLoaded(map:MapLibreMapType) {
  await initializeLayers(map)
  mapInstance = map
  void syncPortalBoundary(activePortalUuid.value)
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

watch(activePortalUuid, portalUuid => {
  void syncPortalBoundary(portalUuid)
})

onBeforeUnmount(() => {
  boundaryRequestVersion += 1
  boundaryRequest?.abort()
  boundaryRequest = null

  if (mapInstance) {
    removePortalBoundary(mapInstance)
    mapInstance = null
  }

  boundaryCache.clear()
})

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
    const query: Record<string, string> = { bbox }

    if (filtersStore.eventPortalUuid) {
      query.portal = filtersStore.eventPortalUuid
    }

    const response = await $api<any>('/api/venues/geojson', { query })
    venues.value = normalizeVenueMarkers(response.data ?? response)
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
