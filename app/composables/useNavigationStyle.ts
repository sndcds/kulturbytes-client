import type { CSSProperties } from 'vue'

const NORMAL_NAV_HEIGHT = '58px'
const PORTAL_NAV_HEIGHT = '72px'
const LOGO_MARGIN = '12px'

export function cssLength(
    value: string | null | undefined,
    fallback: string
) {
    return value && /^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value.trim())
        ? value.trim()
        : fallback
}

export function useNavigationStyle() {
    const filtersStore = useFiltersStore()
    const { activePortal } = usePortal()

    const isPortalActive = computed(() =>
        Boolean(filtersStore.eventPortalIdentifier)
    )

    const navigationStyle = computed<CSSProperties>(() => {
        const style = isPortalActive.value
            ? activePortal.value?.config?.style
            : null

        return {
            '--kbts-nav-height': cssLength(
                style?.nav_height,
                isPortalActive.value ? PORTAL_NAV_HEIGHT : NORMAL_NAV_HEIGHT
            ),
            '--kbts-logo-top-margin': cssLength(
                style?.logo?.top_margin,
                LOGO_MARGIN
            ),
            '--kbts-logo-bottom-margin': cssLength(
                style?.logo?.bottom_margin,
                LOGO_MARGIN
            ),
        }
    })

    return {
        isPortalActive,
        navigationStyle,
    }
}
