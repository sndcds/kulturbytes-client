<template>
  <div
      ref="container"
      class="map-container"
      v-bind="$attrs"
      :style="{ height }"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'
import type { Map as MapLibreMapType } from 'maplibre-gl'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
    defineProps<{
      center?: [number,number]
      zoom?: number
      bearing?: number
      pitch?: number
      height?: string
      fadeDuration?: number
      style?: string
    }>(),
    {
      center: () => [9.43,54.78],
      zoom: 8,
      bearing: 0,
      pitch: 0,
      height: '400px',
      fadeDuration: 300,
      style: '/versatiles/versatiles-style.json'
    }
)

const emit = defineEmits<{
  mapLoaded:[
    map:MapLibreMapType
  ]
}>()

const container = ref<HTMLDivElement | null>(null)

let map: MapLibreMapType | null = null

const safeCenter = computed<[number, number]>(() => {
  const [lng, lat] = props.center
  if (
      Number.isFinite(lng) &&
      Number.isFinite(lat)
  ) {
    return [lng, lat]
  }
  return [9.43, 54.78]
})

onMounted(async() => {
  const maplibregl =
      await import('maplibre-gl')
          .then(m=>m.default)

  if (!container.value) {
    return
  }

  map =
      new maplibregl.Map({
        container: container.value,
        style: props.style,
        center: safeCenter.value,
        zoom: props.zoom,
        bearing: props.bearing,
        pitch: props.pitch,
        fadeDuration: props.fadeDuration
      })

  map.addControl(
      new maplibregl.NavigationControl()
  )

  map.on(
      'load',
      () => {
        emit(
            'mapLoaded',
            map!
        )
      }
  )
})

onBeforeUnmount(() => {
  map?.remove()
})

</script>


<style scoped>

.map-container{
  width: 100%;
  height: 100%;
}

</style>
