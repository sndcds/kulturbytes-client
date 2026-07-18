export function formatPrice(
    t: (
        key: string,
        params?: Record<string, string | number | null | undefined>
    ) => string,

    locale: string,

    min: number | null | undefined,
    max: number | null | undefined,
    currency?: string | null
): string | null {

    const formatNumber = (value: number) =>
        new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)

    const hasMin = min !== null && min !== undefined
    const hasMax = max !== null && max !== undefined

    if (hasMin && hasMax) {
        // treat identical prices as single value
        if (min === max) {
            return t('event.price_sentence', {
                value: formatNumber(min),
                currency: currency ?? ''
            })
        }

        return t('event.price_between_sentence', {
            min: formatNumber(min),
            max: formatNumber(max),
            currency: currency ?? ''
        })
    }

    if (hasMin) {
        return t('event.price_sentence', {
            value: formatNumber(min),
            currency: currency ?? ''
        })
    }

    if (hasMax) {
        return t('event.price_sentence', {
            value: formatNumber(max),
            currency: currency ?? ''
        })
    }

    return null
}