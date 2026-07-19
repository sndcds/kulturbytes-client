<template>

  <MapLibreMap
      class="venues-map"
      :center="center"
      :zoom="zoom"
      :height="height"
      @map-loaded="onMapLoaded"
  />

</template>



<script setup lang="ts">

import { ref, computed } from 'vue'

import type {
  Map as MapLibreMapType
} from 'maplibre-gl'

import type {
  FeatureCollection
} from 'geojson'


import MapLibreMap from '~/components/map/MapLibreMap.client.vue'

import venueIcon from '~/assets/map/marker.png'

import {
  useMapLibreLayers
} from '~/composables/useMapLibreLayers'



const props =
    withDefaults(
        defineProps<{

          center?:[number,number]

          zoom?:number

          height?:string

        }>(),
        {
          center:()=>[
            9.5,
            54.3
          ],

          zoom:8,

          height:'500px'
        })


const venues =
    ref<FeatureCollection>({
      type:'FeatureCollection',
      features:[]
    })



const layers = computed(()=>({

  venues:{

    data:
    venues.value,


    cluster:true,


    icon:
    venueIcon,


    clusterStyle:{

      circleColor:'#2563eb',

      circleRadius:22,

      circleStrokeWidth:2,

      circleStrokeColor:'#ffffff',

      textSize:13,

      textColor:'#ffffff'

    },


    unclusteredStyle:{

      iconSize:0.75,

      iconAnchor:'bottom',

      iconAllowOverlap:true,

      iconIgnorePlacement:true

    },


    popupTitle(feature:any){

      return String(
          feature.properties?.name ?? ''
      )

    }

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
}
    =
    useMapLibreLayers(
        {
          get layers(){

            return layers.value

          }

        } as any,

        maplibregl
    )



const center =
    props.center


const zoom =
    props.zoom


const height =
    props.height



async function onMapLoaded(
    map:MapLibreMapType
){

  console.log(
      'VENUES MAP READY'
  )


  await initializeLayers(
      map
  )


  await loadVenues(
      map
  )


  map.on(
      'moveend',
      ()=>loadVenues(map)
  )

}



async function loadVenues(
    map: MapLibreMapType
) {
  const bounds =
      map.getBounds()

  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',')


  const { $api } = useNuxtApp()


  try {
    const response =
        await $api<any>(
            '/api/venues/geojson',
            {
              query: {
                bbox
              }
            }
        )


    venues.value =
        response.data ?? response


    updateSources(
        map,
        layers.value
    )

  } catch (error) {

    console.error(
        'Failed loading venues:',
        error
    )

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