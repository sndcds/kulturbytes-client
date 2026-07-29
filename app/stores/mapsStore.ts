import { defineStore } from 'pinia'
import { ref } from 'vue'

type MapViewState = {
    center: [number, number] | null
    zoom: number | null
    bearing: number | null
    pitch: number | null
}

export const useMapsStore = defineStore(
    'maps',
    () => {
        const venueMap =
            ref<MapViewState>({
                center: null,
                zoom: null,
                bearing: null,
                pitch: null,
            })

        function setVenueMapView(
            viewState: Partial<MapViewState>
        ) {
            venueMap.value = {
                ...venueMap.value,
                ...viewState,
            }
        }

        return {
            venueMap,
            setVenueMapView,
        }
    },
    {
        persist: true,
    }
)
