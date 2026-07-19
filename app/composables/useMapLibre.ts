import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useThemeStore } from '~/stores/themeStore'
import { useMapLibreLayers } from '~/composables/useMapLibreLayers'
import type { MapLayerConfig } from '~/composables/useMapLibreLayers'


interface Props {
    layers: Record<string, MapLayerConfig>
    center?: LngLatLike
    zoom?: number
    height?: string
    enablePopups?: boolean
    styleLight?: string
    styleDark?: string
}

const props = withDefaults(
    defineProps<Props>(),
    {
        center: () => [9.43,54.78],
        zoom: 12,
        height: '100%'
    }
)

export function useMapLibre(
    props: Props,
    emit: (
        event: 'mapLoaded',
        map: MapLibreMap
    ) => void
) {
    const container = ref<HTMLElement | null>(null)
    const map = ref<MapLibreMap | null>(null)
    const themeStore = useThemeStore()

    let layersApi:
        ReturnType<typeof useMapLibreLayers>
        | null = null


    async function createMap() {
        if (!container.value) {
            return
        }

        /*
         * Important:
         * use default export, not module namespace
         */
        const maplibregl = await import('maplibre-gl').then(
            m => m.default
        )

        layersApi =
            useMapLibreLayers(
                props,
                maplibregl
            )

        const instance =
            new maplibregl.Map({
                container: container.value,
                style:
                    themeStore.theme === 'dark'
                        ? props.styleDark
                        : props.styleLight,
                center:
                    props.center
                    ??
                    [
                        9.437,
                        54.788
                    ],
                zoom: props.zoom ?? 8,
                minZoom: 2,
                maxZoom: 19,
            })

        instance.addControl(
            new maplibregl.NavigationControl()
        )

        instance.on(
            'load',
            async () => {
                await layersApi?.initializeLayers(instance)

                requestAnimationFrame(
                    () => {
                        instance.resize()
                    }
                )

                emit('mapLoaded', instance)
            }
        )

        map.value = instance
    }



    watch(
        () => props.layers,

        layers => {
            if (!map.value || !layersApi) {
                return
            }

            layersApi.updateSources(map.value, layers)
        },
        {
            deep: true
        }
    )

    watch(
        () => themeStore.theme,

        theme => {
            if (!map.value) {
                return
            }

            map.value.setStyle(
                theme === 'dark'
                    ? props.styleDark!
                    : props.styleLight!
            )

            map.value.once(
                'style.load',
                async () => {
                    await layersApi?.initializeLayers(map.value!)

                    requestAnimationFrame(
                        () => {
                            map.value?.resize()
                        }
                    )
                }
            )
        }
    )

    onBeforeUnmount(
        () => {
            layersApi?.removePopup()
            map.value?.remove()
            map.value = null
        }
    )

    onMounted(
        createMap
    )

    return {
        container,
        map,
    }
}