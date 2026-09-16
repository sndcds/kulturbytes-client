import { h, render } from 'vue'
import type { Component } from 'vue'
import type { VenueFeature, VenueProperties } from '~/types/mapMarkers'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import type { Point, FeatureCollection } from 'geojson'
import { markerRegistry } from '~/components/map/markers/mapMarkerRegistry'


interface MarkerConfig {
    enabled?: boolean
    styleProperty?: string  // example: "cultural-center"
    idProperty?: keyof VenueProperties // example: uuid
    defaultStyle?: string // fallback component
}

interface ManagedMarker {
    marker:Marker
    element:HTMLElement
    feature:VenueFeature
}

export function useMapLibreMarkers(
    map: MapLibreMap,
    maplibregl: typeof import('maplibre-gl'),
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
        const style =
            (feature.properties as unknown as Record<string, string | null | undefined>)[styleProperty]
            ?? defaultStyle
        return (
            markerRegistry[style] ?? markerRegistry[defaultStyle] ?? markerRegistry.default
        )
    }

    function createMarker(feature:VenueFeature){
        const id = getId(feature)
        const element = document.createElement('div')
        const Component = getComponent(feature)

        const vnode =
            h(
                Component,
                {
                    feature
                }
            )

        render(
            vnode,
            element
        )

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
                element,
                feature
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

        const [longitude, latitude] = feature.geometry.coordinates
        if (longitude === undefined || latitude === undefined) return

        existing.marker.setLngLat([longitude, latitude])
        Object.assign(existing.feature.properties, feature.properties)

    }

    function removeMarker(id:string){
        const existing = markers.get(id)
        if (!existing)
            return

        existing.marker.remove()
        render(null, existing.element)

        markers.delete(id)
    }

    function syncMarkers(collection:FeatureCollection<Point, VenueProperties>){
        const incoming = new Set<string>()

        for (const feature of collection.features){
            if (feature.geometry.type !== 'Point')
                continue

            const id = getId(feature)
            incoming.add(id)
            updateMarker(feature)
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