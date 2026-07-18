// utils/ics.ts

export function createIcsFileName(
    title: string,
    eventDateUuid: string
): string {
    const normalized = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')

    const base = normalized || 'event'

    return `${base}-${eventDateUuid}.ics`
}