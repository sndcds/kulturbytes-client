export function imageUrl(
    imagePath: string | null | undefined,
    width = 480,
    ratio = '16:9'
) {
    if (!imagePath) return ''

    const separator = imagePath.includes('?') ? '&' : '?'

    return `${imagePath}${separator}width=${width}&ratio=${encodeURIComponent(ratio)}`
}