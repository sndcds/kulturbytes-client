<template>
  <section class="portal-geometry-map" :aria-labelledby="headingId">
    <h2 :id="headingId">{{ childType }}</h2>
    <select
        :aria-label="t('portal.choose_area')"
        :value="selectedUuid ?? ''"
        @change="selectArea"
    >
      <option value="">{{ t('portal.entire_area') }}</option>
      <option v-for="geometry in geometries" :key="geometry.uuid" :value="geometry.uuid">
        {{ geometry.name }}
      </option>
    </select>
    <MapLibreMap height="320px" @map-loaded="onMapLoaded" />
    <button type="button" class="kbts-button" @click="resetArea">
      {{ t('portal.entire_area') }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, useId, watch } from 'vue'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { GeoJSONSource, Map as MapLibreMapType, MapLayerMouseEvent } from 'maplibre-gl'
import MapLibreMap from '~/components/map/MapLibreMap.client.vue'
import type { PortalGeometry } from '~/types/portal'
import { portalGeometryBounds } from '~/utils/portalGeometry'

const props = defineProps<{
  mainGeometry: PortalGeometry
  childType: string
  geometries: PortalGeometry[]
  modelValue: string | null
}>()
const emit = defineEmits<{ 'update:modelValue': [uuid: string | null] }>()
const { t } = useI18n()
const headingId = useId()
const selectedUuid = computed(() =>
    props.geometries.some(geometry => geometry.uuid === props.modelValue) ? props.modelValue : null
)
let mapInstance: MapLibreMapType | null = null
let resizeObserver: ResizeObserver | null = null

function featureCollection(geometries: PortalGeometry[]): FeatureCollection<Polygon | MultiPolygon> {
  return {
    type: 'FeatureCollection',
    features: geometries.flatMap(geometry => geometry.geometry ? [{
      type: 'Feature' as const,
      geometry: geometry.geometry,
      properties: { uuid: geometry.uuid, name: geometry.name },
    }] : []),
  }
}

function fitMainGeometry() {
  const bounds = portalGeometryBounds(props.mainGeometry.geometry)
  if (bounds) mapInstance?.fitBounds(bounds, { padding: 24, duration: 0, maxZoom: 14 })
}

function updateSelection() {
  mapInstance?.setFilter('portal-selection-fill', ['==', ['get', 'uuid'], selectedUuid.value ?? ''])
  mapInstance?.setFilter('portal-selection-outline', ['==', ['get', 'uuid'], selectedUuid.value ?? ''])
}

function onGeometryClick(event: MapLayerMouseEvent) {
  const uuid = event.features?.[0]?.properties?.uuid
  if (typeof uuid === 'string' && props.geometries.some(geometry => geometry.uuid === uuid)) {
    emit('update:modelValue', uuid)
  }
}

function selectArea(event: Event) {
  const uuid = (event.target as HTMLSelectElement).value
  if (uuid) emit('update:modelValue', uuid)
  else resetArea()
}

function resetArea() {
  emit('update:modelValue', null)
  fitMainGeometry()
}

function onMapLoaded(map: MapLibreMapType) {
  mapInstance = map
  map.addSource('portal-main', { type: 'geojson', data: featureCollection([props.mainGeometry]) })
  map.addSource('portal-children', { type: 'geojson', data: featureCollection(props.geometries) })
  map.addLayer({
    id: 'portal-main-outline', type: 'line', source: 'portal-main',
    paint: { 'line-color': '#243f6e', 'line-width': 2 },
  })
  map.addLayer({
    id: 'portal-children-fill', type: 'fill', source: 'portal-children',
    paint: { 'fill-color': '#3f72e8', 'fill-opacity': 0.2 },
  })
  map.addLayer({
    id: 'portal-children-outline', type: 'line', source: 'portal-children',
    paint: { 'line-color': '#243f6e', 'line-width': 1 },
  })
  map.addLayer({
    id: 'portal-selection-fill', type: 'fill', source: 'portal-children',
    paint: { 'fill-color': '#3f72e8', 'fill-opacity': 0.55 },
  })
  map.addLayer({
    id: 'portal-selection-outline', type: 'line', source: 'portal-children',
    paint: { 'line-color': '#243f6e', 'line-width': 3 },
  })
  updateSelection()
  map.on('click', 'portal-children-fill', onGeometryClick)
  map.on('mouseenter', 'portal-children-fill', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'portal-children-fill', () => { map.getCanvas().style.cursor = '' })
  map.resize()
  fitMainGeometry()
  resizeObserver = new ResizeObserver(() => { map.resize() })
  resizeObserver.observe(map.getContainer())
}

watch(selectedUuid, () => {
  if (mapInstance) updateSelection()
})
watch(() => props.mainGeometry, () => {
  if (!mapInstance) return
  const source = mapInstance.getSource('portal-main') as GeoJSONSource
  source.setData(featureCollection([props.mainGeometry]))
  fitMainGeometry()
})
watch(() => props.geometries, () => {
  if (!mapInstance) return
  const source = mapInstance.getSource('portal-children') as GeoJSONSource
  source.setData(featureCollection(props.geometries))
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  // MapLibreMap owns the map and removes it with its event handlers.
  mapInstance = null
})
</script>

<style scoped>
.portal-geometry-map {
  display: flex;
  flex-direction: column;
  gap: .75rem;
  width: 100%;
  min-width: 0;
}

h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
}

select {
  width: 100%;
  min-width: 0;
  padding: .4rem;
  font: inherit;
  color: var(--kbts-fg);
  background: var(--kbts-bg);
  border: 1px solid var(--kbts-input-border);
  border-radius: var(--kbts-input-border-radius);
}
</style>
