import { computed, ref, watch, type Ref } from 'vue'

interface UseImageSizeOptions {
    maxWidth: number
    maxHeight: number
    pixelCount: number
}

interface ImageSize {
    width: number
    height: number
}

export function useImageSize(
    src: Ref<string | null | undefined>,
    options: UseImageSizeOptions,
) {

    const size = ref<ImageSize | null>(null)
    const isLoaded = ref(false)
    const isLoading = ref(false)
    let requestId = 0

    watch(
        src,
        async (url) => {
            const currentRequest = ++requestId

            size.value = null
            isLoaded.value = false

            if (!url) {
                isLoading.value = false
                return
            }

            isLoading.value = true

            try {
                const {
                    width,
                    height,
                } = await getImageSize(url)

                // Ignore outdated requests
                if (currentRequest !== requestId) {
                    return
                }

                size.value = calculateSize(
                    width,
                    height,
                    options,
                )
            } catch {
                size.value = null
            } finally {
                if (currentRequest === requestId) {
                    isLoading.value = false
                }
            }
        },
        {
            immediate: true,
        },
    )

    const containerStyle = computed(() => {
        if (!size.value) {
            return undefined
        }

        return {
            width: `${size.value.width}px`,
            height: `${size.value.height}px`,
        }
    })

    function onLoad() {
        isLoaded.value = true
    }

    return {
        size,
        containerStyle,
        isLoaded,
        isLoading,
        onLoad,
    }
}


function getImageSize(
    url: string,
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight,
            })
        }

        image.onerror = reject

        image.src = url
    })
}


function calculateSize(
    naturalWidth: number,
    naturalHeight: number,
    options: UseImageSizeOptions,
): ImageSize {
    const aspectRatio = naturalWidth / naturalHeight

    let width = Math.sqrt(
        options.pixelCount * aspectRatio,
    )

    let height = Math.sqrt(
        options.pixelCount / aspectRatio,
    )

    const scale = Math.min(
        options.maxWidth / width,
        options.maxHeight / height,
        1,
    )

    width *= scale
    height *= scale

    return {
        width: Math.round(width),
        height: Math.round(height),
    }
}