import type { ApiResponse } from '~/types/api'
import type { Portal } from '~/types/portal'
import { isUuidV7 } from '~/utils/uuid'

export function usePortal() {
    const filtersStore = useFiltersStore()
    const { $api } = useNuxtApp()
    const activePortal = useState<Portal | null>('active-portal', () => null)
    const activePortalIdentifier = useState<string | null>(
        'active-portal-identifier',
        () => null
    )

    async function activatePortal(identifier: string) {
        const normalizedIdentifier = identifier.trim()

        if (!normalizedIdentifier) {
            clearPortal()
            return null
        }

        filtersStore.eventPortalIdentifier = normalizedIdentifier
        filtersStore.eventPortalUuid = isUuidV7(normalizedIdentifier)
            ? normalizedIdentifier
            : null

        const cachedPortal = activePortal.value

        if (
            cachedPortal &&
            (
                cachedPortal.uuid === filtersStore.eventPortalUuid ||
                activePortalIdentifier.value === normalizedIdentifier
            )
        ) {
            filtersStore.eventPortalUuid = cachedPortal.uuid
            return cachedPortal
        }

        activePortal.value = null
        activePortalIdentifier.value = null

        const response = await $api<ApiResponse<Portal>>(
            `/api/portal2/${encodeURIComponent(normalizedIdentifier)}`
        )

        // Ignore a response that belongs to a portal which is no longer active.
        if (filtersStore.eventPortalIdentifier !== normalizedIdentifier) {
            return null
        }

        activePortal.value = response.data
        activePortalIdentifier.value = normalizedIdentifier
        filtersStore.eventPortalUuid = response.data.uuid

        return response.data
    }

    async function initializePortal(identifier?: string) {
        const requestedIdentifier = identifier?.trim()
        const portalIdentifier = requestedIdentifier
            || filtersStore.eventPortalIdentifier

        if (!portalIdentifier) {
            return null
        }

        try {
            // Also synchronizes the persisted filter store when the portal
            // itself has already been restored from the SSR payload.
            return await activatePortal(portalIdentifier)
        } catch (error) {
            console.error('Failed restoring portal:', error)
            return null
        }
    }

    function clearPortal() {
        activePortal.value = null
        activePortalIdentifier.value = null
        filtersStore.eventPortalIdentifier = null
        filtersStore.eventPortalUuid = null
    }

    return {
        activePortal,
        activatePortal,
        initializePortal,
        clearPortal,
    }
}
