import type { Component } from 'vue'
import { h, render, nextTick } from 'vue'

import type {
    Feature,
    FeatureCollection,
} from 'geojson'

import type {
    Map as MapLibreMap,
    Popup,
    GeoJSONSource,
} from 'maplibre-gl'



type MapLibreModule =
    typeof import('maplibre-gl')

export type IconAnchor =
    | 'center'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'

export interface MapLayerConfig {
    data: FeatureCollection
    cluster?: boolean
    icon?: string
    iconProperty?: string
    icons?: Record<string,string>
    defaultIcon?: string
    minzoom?: number
    maxzoom?: number

    clusterStyle?: {
        circleColor?: string
        circleRadius?: any
        circleStrokeWidth?: number
        circleStrokeColor?: string
        textField?: any
        textSize?: number
        textColor?: string
    }

    unclusteredStyle?: {
        circleRadius?: number
        circleColor?: string
        circleStrokeWidth?: number
        circleStrokeColor?: string

        iconSize?: number
        iconAnchor?: IconAnchor
        iconAllowOverlap?: boolean
        iconIgnorePlacement?: boolean
    }

    label?: {
        field: string
        minzoom?: number
        textSize?: number
        textColor?: string
        textHaloColor?: string
        textHaloWidth?: number
        textOffset?: [number, number]
        textAnchor?: IconAnchor
        allowOverlap?: boolean
    }

    popupStyle?: {
        className?: string
        maxWidth?: string
        closeButton?: boolean
        offset?: [number, number]
    }

    popupComponent?: Component
}

interface Props {
    layers:
        Record<string, MapLayerConfig>
}

export function useMapLibreLayers(props: Props, maplibregl: MapLibreModule) {

    let currentPopup: Popup | null = null
    let currentPopupContainer: HTMLElement | null = null

    const removePopup = () => {
        if (currentPopupContainer) {
            render(
                null,
                currentPopupContainer
            )
            currentPopupContainer = null
        }

        if (currentPopup) {
            currentPopup.remove()
            currentPopup = null
        }
    }

    const addIcon = async (
        map: MapLibreMap,
        name:string,
        url?:string
    ) => {
        if (!url)
            return

        if (map.hasImage(name))
            return

        try {
            const image = await map.loadImage(url)
            map.addImage(name, image.data, { pixelRatio:2 })
        } catch(error){
            console.error('ICON FAILED:', name, url, error)
        }
    }

    const addPopup = (
        map: MapLibreMap,
        layerName: string,
        config: MapLayerConfig
    ) => {

        if (!config.popupComponent) {
            return
        }

        const popupComponent =
            config.popupComponent

        map.on(
            'click',
            `${layerName}-unclustered`,

            async event => {

                const feature =
                    event.features?.[0]

                if (!feature) {
                    return
                }

                if (
                    feature.geometry.type !== 'Point'
                ) {
                    return
                }

                removePopup()

                const container =
                    document.createElement('div')

                const vnode =
                    h(
                        popupComponent,
                        {
                            feature
                        }
                    )

                render(
                    vnode,
                    container
                )

                currentPopupContainer =
                    container

                await nextTick()

                currentPopup =
                    new maplibregl.Popup({
                        closeButton:
                            config.popupStyle?.closeButton ?? false,

                        closeOnClick:
                            true,

                        maxWidth:
                            config.popupStyle?.maxWidth ?? '320px',

                        className:
                            config.popupStyle?.className ?? '',

                        offset:
                            config.popupStyle?.offset ?? [0, -15]
                    })
                        .setLngLat(
                            feature.geometry.coordinates as [number, number]
                        )
                        .setDOMContent(
                            container
                        )
                        .addTo(
                            map
                        )

                currentPopup.on(
                    'close',
                    removePopup
                )

                currentPopup.getElement()
                    ?.querySelector(
                        '[data-popup-close]'
                    )
                    ?.addEventListener(
                        'click',
                        removePopup,
                        {
                            once:true
                        }
                    )
            }
        )
    }

    const addCursor = (
        map: MapLibreMap,
        layerId: string
    ) => {

        map.on(
            'mouseenter',
            layerId,
            () => {
                map.getCanvas().style.cursor = 'pointer'
            }
        )

        map.on(
            'mouseleave',
            layerId,
            () => {
                map.getCanvas().style.cursor = ''
            }
        )
    }

    const addClusterZoom = (
        map: MapLibreMap,
        layerName: string
    ) => {

        const zoomToCluster = async (event: any) => {
            const feature =
                event.features?.[0]

            if (!feature || feature.geometry.type !== 'Point') {
                return
            }

            const clusterId =
                feature.properties?.cluster_id

            if (clusterId === undefined) {
                return
            }

            const source =
                map.getSource(layerName) as GeoJSONSource | undefined

            if (!source) {
                return
            }

            const zoom =
                await source.getClusterExpansionZoom(
                    Number(clusterId)
                )

            removePopup()

            map.easeTo({
                center: feature.geometry.coordinates as [number, number],
                zoom,
            })
        }

        for (const layerId of [
            `${layerName}-clusters`,
            `${layerName}-cluster-count`
        ]) {
            map.on(
                'click',
                layerId,
                zoomToCluster
            )

            addCursor(
                map,
                layerId
            )
        }
    }

    const addLayer = async (
        map: MapLibreMap,
        name: string,
        config: MapLayerConfig
    ) => {

        if (config.icons) {
            for (const [iconName, url] of Object.entries(config.icons)) {
                await addIcon(map, iconName, url)
            }
        } else {
            await addIcon(map, name, config.icon)
        }

        map.addSource(
            name,
            {
                type:'geojson',
                data: config.data,
                cluster: config.cluster ?? false,
                clusterRadius: 50,
                clusterMaxZoom: 14,
            }
        )

        /*
         * Cluster circle layer
         */
        if (config.cluster) {
            map.addLayer({
                id:`${name}-clusters`,
                type:'circle',
                source:name,
                filter:[
                    'has',
                    'point_count'
                ],
                paint:{
                    'circle-color': config.clusterStyle?.circleColor ?? '#2563eb',
                    'circle-radius': config.clusterStyle?.circleRadius ?? 22,
                    'circle-stroke-width': config.clusterStyle?.circleStrokeWidth ?? 2,
                    'circle-stroke-color': config.clusterStyle?.circleStrokeColor ?? '#ffffff'
                }
            })

            /*
             * Cluster number text
             */
            map.addLayer({
                id:`${name}-cluster-count`,
                type:'symbol',
                source:name,
                filter:[
                    'has',
                    'point_count'
                ],
                layout:{
                    'text-field':
                        config.clusterStyle?.textField
                        ??
                        [
                            'get',
                            'point_count_abbreviated'
                        ],

                    'text-size':
                        config.clusterStyle?.textSize
                        ??
                        13,

                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                },

                paint:{
                    'text-color':
                        config.clusterStyle?.textColor
                        ??
                        '#ffffff'
                }
            })
        }

        const style = config.unclusteredStyle ?? {}

        /*
         * Normal markers
         */
        if (config.icon || config.iconProperty) {
            map.addLayer({
                id:`${name}-unclustered`,
                type:'symbol',
                source:name,
                filter:[
                    '!',
                    [
                        'has',
                        'point_count'
                    ]
                ],
                layout: {
                    'icon-image': [
                        'case',
                        [
                            'has',
                            config.iconProperty ?? 'marker_style'
                        ],
                        [
                            'coalesce',
                            [
                                'get',
                                config.iconProperty ?? 'marker_style'
                            ],
                            'default'
                        ],
                        'default'
                    ],
                    'icon-size': style.iconSize ?? 1,
                    'icon-anchor': style.iconAnchor ?? 'bottom',
                    'icon-allow-overlap': style.iconAllowOverlap ?? true,
                    'icon-ignore-placement': style.iconIgnorePlacement ?? true,
                }
            })
        } else {
            map.addLayer({
                id:`${name}-unclustered`,
                type:'circle',
                source:name,
                filter:[
                    '!',
                    [
                        'has',
                        'point_count'
                    ]
                ],
                paint:{
                    'circle-radius':
                        style.circleRadius
                        ??
                        8,

                    'circle-color':
                        style.circleColor
                        ??
                        '#ff0000',

                    'circle-stroke-width':
                        style.circleStrokeWidth
                        ??
                        0,

                    'circle-stroke-color':
                        style.circleStrokeColor
                        ??
                        '#ffffff'
                }
            })
        }

        /*

         * Venue labels

         */

        if (config.label) {
            map.addLayer({
                id: `${name}-labels`,
                type: 'symbol',
                source: name,
                minzoom: config.label.minzoom ?? 12,
                filter: [
                    '!',
                    [
                        'has',
                        'point_count'
                    ]
                ],
                layout:{
                    'text-field': ['get', config.label.field],
                    'text-size': config.label.textSize ?? 12,
                    'text-offset': config.label.textOffset ?? [0, 0.5],
                    'text-anchor': config.label.textAnchor ?? 'top',
                    'text-allow-overlap': config.label.allowOverlap ?? false
                },
                paint:{
                    'text-color': config.label.textColor ?? '#243f6e',
                    'text-halo-color': config.label.textHaloColor ?? '#ffffff',
                    'text-halo-width': config.label.textHaloWidth ?? 1
                }
            })
        }

        if (config.cluster) {
            addClusterZoom(map, name)
        }

        addCursor(map, `${name}-unclustered`)
        addPopup(map, name, config)
    }

    const initializeLayers = async (
        map: MapLibreMap
    ) => {

        for (
            const [
                name,
                config
            ]
            of Object.entries(props.layers)
            ) {


            if (
                map.getSource(name)
            ) {
                continue
            }

            await addLayer(
                map,
                name,
                config
            )
        }
    }

    const updateSources = (
        map: MapLibreMap,
        layers: Record<string, MapLayerConfig>
    ) => {

        for (
            const [
                name,
                config
            ]
            of Object.entries(layers)
            ) {

            const source = map.getSource(name)

            if (!source || source.type !== 'geojson') {
                continue
            }


            (
                source as GeoJSONSource
            )
                .setData(
                    config.data
                )
        }
    }

    return {
        initializeLayers,
        updateSources,
        removePopup,
        addLayer,
    }
}
