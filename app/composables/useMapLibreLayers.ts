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

    popupTitle?: (feature: Feature) => string
    popupContent?: (feature: Feature) => string
}

interface Props {
    layers:
        Record<string, MapLayerConfig>
}

export function useMapLibreLayers(props: Props, maplibregl: MapLibreModule) {

    let currentPopup: Popup | null = null

    const removePopup = () => {
        currentPopup?.remove()
        currentPopup = null
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
            console.log('ICON REGISTERED:', name, map.hasImage(name))
        } catch(error){
            console.error('ICON FAILED:', name, url, error)
        }
    }

    const addPopup = (
        map: MapLibreMap,
        layerName: string,
        config: MapLayerConfig
    ) => {

        if (
            !config.popupTitle &&
            !config.popupContent
        ) {
            return
        }

        map.on(
            'click',
            `${layerName}-unclustered`,

            event => {
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

                currentPopup =
                    new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                    })
                        .setLngLat(
                            feature.geometry.coordinates as [
                                number,
                                number
                            ]
                        )

                        .setHTML(
                            `
                        <div class="map-popup">
                        ${
                                config.popupTitle
                                    ? `<strong>
                                    ${config.popupTitle(feature)}
                                   </strong>`
                                    : ''
                            }
                        ${
                                config.popupContent
                                ??
                                ''
                            }
                        <button data-popup-close>×</button>
                        </div>
                        `
                        )

                        .addTo(map)

                currentPopup
                    .getElement()
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
        layerName: string
    ) => {

        const layerId = `${layerName}-unclustered`

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

                    'circle-color':
                        config.clusterStyle?.circleColor
                        ??
                        '#2563eb',

                    'circle-radius':
                        config.clusterStyle?.circleRadius
                        ??
                        22,

                    'circle-stroke-width':
                        config.clusterStyle?.circleStrokeWidth
                        ??
                        2,

                    'circle-stroke-color':
                        config.clusterStyle?.circleStrokeColor
                        ??
                        '#ffffff'
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
                        13
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

        addCursor(map, name)
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