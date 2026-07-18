import { computed, type Ref } from 'vue'

interface UseImageUrlOptions {
    width?: number
    height?: number
    type?: string
    quality?: number
}

export function useImageUrl(
    sourceUrl: Ref<string | null | undefined>,
    options: UseImageUrlOptions = {},
) {

    const imageUrl = computed(() => {
        const url = sourceUrl.value

        if (!url) {
            return null
        }

        return buildImageUrl(url, options)
    })

    return {
        imageUrl,
    }
}


function buildImageUrl(
    sourceUrl: string,
    options: UseImageUrlOptions,
): string {

    const url = new URL(sourceUrl)

    if (options.width) {
        url.searchParams.set(
            'width',
            String(options.width),
        )
    }

    if (options.height) {
        url.searchParams.set(
            'height',
            String(options.height),
        )
    }

    if (options.type) {
        url.searchParams.set(
            'type',
            options.type,
        )
    }

    if (options.quality) {
        url.searchParams.set(
            'quality',
            String(options.quality),
        )
    }

    return url.toString()
}