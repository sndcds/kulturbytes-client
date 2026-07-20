import { createApp } from 'vue'
import type { Component } from 'vue'
import type { VenueFeature } from '~/types/mapMarkers'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { Feature, Point, FeatureCollection } from 'geojson'
import { markerRegistry } from '~/components/map/markers/mapMarkerRegistry'


interface MarkerConfig {
    enabled?: boolean
    styleProperty?: string  // example: "cultural-center"
    idProperty?: string // example: uuid
    defaultStyle?: string // fallback component
}

interface ManagedMarker {
    marker:Marker
    app:ReturnType<typeof createApp>
    element:HTMLElement
    feature:VenueFeature
}

export function useMapLibreMarkers(
    map: MapLibreMap,
    maplibregl:any,
    config:MarkerConfig = {}
){

    const {
        styleProperty = 'marker_style',
        idProperty = 'uuid',
        defaultStyle = 'default'
    } = config

    const markers = new Map<string, ManagedMarker>()


    function getId(feature:VenueFeature){
        return String(feature.properties?.[idProperty])
    }

    function getComponent(feature:VenueFeature):Component {
        const style = feature.properties.marker_style ?? defaultStyle
        return (
            markerRegistry[style] ?? markerRegistry[defaultStyle]
        )
    }

    function createMarker(feature:Feature<Point>){
        const id = getId(feature)
        const element = document.createElement('div')
        const Component = getComponent(feature)
        const app = createApp(Component, { feature })

        app.mount(element)

        const marker =
            new maplibregl.Marker({
                element,
                anchor:'bottom'
            })
                .setLngLat(
                    feature.geometry.coordinates as [number,number]
                )
                .addTo(map)

        markers.set(
            id,
            {
                marker,
                app,
                element
            }
        )
    }

    function updateMarker(feature:VenueFeature){
        const id = getId(feature)
        const existing = markers.get(id)

        if (!existing) {
            createMarker(feature)
            return
        }

        existing.marker.setLngLat(feature.geometry.coordinates)
        Object.assign(existing.feature.properties, feature.properties)

    }

    function removeMarker(id:string){
        const existing = markers.get(id)
        if (!existing)
            return

        existing.marker.remove()
        existing.app.unmount()

        markers.delete(id)
    }

    function syncMarkers(collection:FeatureCollection){
        const incoming = new Set<string>()

        for (const feature of collection.features){
            if (feature.geometry.type !== 'Point')
                continue

            const id = getId(feature as Feature<Point>)
            incoming.add(id)
            updateMarker(feature as Feature<Point>)
        }

        for (const id of markers.keys()){
            if(!incoming.has(id)){
                removeMarker(id)
            }
        }
    }

    function clearMarkers(){
        for(const id of markers.keys()){
            removeMarker(id)
        }
    }

    return {
        syncMarkers,
        clearMarkers
    }
}