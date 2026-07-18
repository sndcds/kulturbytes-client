export function ensureHttpOrHttps(url: string): string {
    const trimmed = url.trim()

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }

    return `https://${trimmed}`
}