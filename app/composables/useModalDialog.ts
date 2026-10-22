import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useModalDialog(
    dialog: Ref<HTMLDialogElement | null>,
    onOpen?: (position: { x: number, y: number }) => void,
) {
    let release: (() => void) | undefined

    function close() {
        release?.()
    }

    onMounted(() => {
        const body = document.body
        const root = document.documentElement
        const scrollX = window.scrollX
        const scrollY = window.scrollY
        const previousStyles = {
            position: body.style.position, top: body.style.top,
            left: body.style.left, width: body.style.width, overflow: body.style.overflow,
        }
        const rootOverflow = root.style.overflow
        const rootScrollbarGutter = root.style.scrollbarGutter
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null

        onOpen?.({ x: scrollX, y: scrollY })
        Object.assign(body.style, { position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, width: '100%', overflow: 'hidden' })
        root.style.overflow = 'hidden'
        // A stable scrollbar gutter would leave a gap beside a full viewport dialog.
        root.style.scrollbarGutter = 'auto'
        dialog.value?.showModal()

        release = () => {
            release = undefined
            dialog.value?.close()
            Object.assign(body.style, previousStyles)
            root.style.overflow = rootOverflow
            root.style.scrollbarGutter = rootScrollbarGutter
            window.scrollTo(scrollX, scrollY)
            previousFocus?.focus({ preventScroll: true })
        }
    })

    onBeforeUnmount(close)

    return { close }
}
