export function cleanObject(value: unknown): unknown {
    if (Array.isArray(value)) {
        const cleanedArray = value
            .map(item => cleanObject(item))
            .filter(item => item !== undefined)

        return cleanedArray.length > 0
            ? cleanedArray
            : undefined
    }

    if (value !== null && typeof value === 'object') {
        const cleanedObject = Object.fromEntries(
            Object.entries(value)
                .map(([key, val]) => [
                    key,
                    cleanObject(val)
                ])
                .filter(([, val]) => val !== undefined)
        )

        return Object.keys(cleanedObject).length > 0
            ? cleanedObject
            : undefined
    }

    // remove null / undefined
    if (value === null || value === undefined) {
        return undefined
    }

    // remove empty strings
    if (typeof value === 'string') {
        const trimmed = value.trim()

        return trimmed.length > 0
            ? trimmed
            : undefined
    }

    // keep false and 0
    return value
}