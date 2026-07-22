import {
    computed,
    type MaybeRef,
    unref,
} from 'vue'


interface UseImageUrlOptions {
    width?: number
    height?: number
    type?: string
    quality?: number
}


export function useOptimizedImageUrl(
    sourceUrl: MaybeRef<string | null | undefined>,
    options: UseImageUrlOptions = {},
) {

    const optimizedImageUrl = computed(() => {
        const url = unref(sourceUrl)

        if (!url) {
            return null
        }

        return buildImageUrl(url, options)
    })

    return {
        optimizedImageUrl,
    }
}


function buildImageUrl(
    sourceUrl: string,
    options: UseImageUrlOptions,
): string {

    let url: URL

    try {
        url = new URL(sourceUrl)
    } catch {
        return sourceUrl
    }

    if (options.width !== undefined) {
        url.searchParams.set(
            'width',
            String(options.width),
        )
    }

    if (options.height !== undefined) {
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

    if (options.quality !== undefined) {
        url.searchParams.set(
            'quality',
            String(options.quality),
        )
    }

    return url.toString()
}
