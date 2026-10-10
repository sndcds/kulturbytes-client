import { onMounted, onBeforeUnmount } from 'vue'

export function useMobileViewport() {
    // Unknown on the server and during hydration: no speculative filter mounts.
    const isMobile = useState<boolean | null>('mobile-event-filter-viewport', () => null)
    let media: MediaQueryList | undefined
    const update = () => { isMobile.value = media?.matches ?? false }

    onMounted(() => {
        media = window.matchMedia('(max-width: 768px)')
        update()
        media.addEventListener('change', update)
    })
    onBeforeUnmount(() => media?.removeEventListener('change', update))

    return { isMobile }
}
