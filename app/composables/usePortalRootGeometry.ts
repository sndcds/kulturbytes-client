
import type { ApiResponse } from '~/types/api'
import type { PortalGeometries } from '~/types/portal'

export function usePortalRootGeometry(
    portalUuid: MaybeRefOrGetter<string | null | undefined>
) {
    const filtersStore = useFiltersStore()
    const { $api } = useNuxtApp()

    const uuid = computed(() => toValue(portalUuid) || null)

    // Clear the previous portal's geometry when the portal changes.
    watch(
        uuid,
        () => {
            filtersStore.setEventPortalGeometryUuid(null)
        }
    )

    const {
        data: portalGeometries,
        error: geometriesError,
        refresh: refreshGeometries,
        status,
    } = useAsyncData(
        () => `portal-geometries-${uuid.value ?? ''}`,
        async (_nuxtApp, { signal }) => {
            if (!uuid.value) {
                return null
            }

            const response = await $api<ApiResponse<PortalGeometries>>(
                `/api/portal/${encodeURIComponent(uuid.value)}/geometries`,
                { signal }
            )

            return response.data
        }
    )

    const rootGeometry = computed(() => {
        const geometries = portalGeometries.value?.geometry

        if (!Array.isArray(geometries)) {
            return null
        }

        return geometries.find(
            geometry => geometry.parent_uuid === null
        ) ?? null
    })

    watch(
        [uuid, rootGeometry, geometriesError],
        ([currentUuid, geometry, error]) => {
            filtersStore.setEventPortalGeometryUuid(
                currentUuid && !error
                    ? geometry?.uuid ?? null
                    : null
            )
        },
        { immediate: true }
    )

    return {
        portalGeometries,
        rootGeometry,
        geometriesError,
        refreshGeometries,
        pending: computed(() => status.value === 'pending'),
    }
}
