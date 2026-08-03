// utils/truncateText.ts
export function truncateText(
    text: string | null | undefined,
    maxLength: number
): string | undefined {
    if (!text) {
        return undefined
    }

    if (text.length <= maxLength) {
        return text
    }

    if (maxLength <= 3) {
        return '.'.repeat(maxLength)
    }

    return `${text.slice(0, maxLength - 3).trimEnd()}...`
}