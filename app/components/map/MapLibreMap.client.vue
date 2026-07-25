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
      height?: string
      fadeDuration?: number
      style?: string
    }>(),
    {
      center: () => [9.43,54.78],
      zoom: 8,
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

const container =
    ref<HTMLDivElement|null>(null)

let map:
    MapLibreMapType|null = null

onMounted(async()=>{
  const maplibregl =
      await import('maplibre-gl')
          .then(m=>m.default)

  if(!container.value){
    return
  }

  map =
      new maplibregl.Map({
        container: container.value,
        style: props.style,
        center: props.center,
        zoom: props.zoom,
        fadeDuration: props.fadeDuration
      })

  map.addControl(
      new maplibregl.NavigationControl()
  )

  map.on(
      'load',
      ()=>{
        emit(
            'mapLoaded',
            map!
        )
      }
  )
})

onBeforeUnmount(()=>{
  map?.remove()
})

</script>


<style scoped>

.map-container{
  width:100%;
  height:100%;
}

</style>
