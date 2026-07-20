// mapMarkerRegistry.ts

import type { MarkerComponent } from '~/types/mapMarkers'
import DefaultMarker from './DefaultMarker.vue'

export const markerRegistry: Record<string, MarkerComponent> = {
    default: DefaultMarker,
}