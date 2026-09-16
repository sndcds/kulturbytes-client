export function formatPrice(
    t: (
        key: string,
        params?: Record<string, string | number | null | undefined>
    ) => string,
    locale: string,
    minPrice: number | null | undefined,
    maxPrice: number | null | undefined,
    currency?: string | null
): string | null {

    const formatNumber = (value: number) =>
        new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)

    const hasMin = minPrice !== null && minPrice !== undefined
    const hasMax = maxPrice !== null && maxPrice !== undefined

    if (hasMin && hasMax) {
        // treat identical prices as single value
        if (minPrice === maxPrice) {
            return t('event.price_sentence', {
                value: formatNumber(minPrice),
                currency: currency ?? ''
            })
        }

        return t('event.price_between_sentence', {
            min: formatNumber(minPrice),
            max: formatNumber(maxPrice),
            currency: currency ?? ''
        })
    }

    if (hasMin) {
        return t('event.price_sentence', {
            value: formatNumber(minPrice),
            currency: currency ?? ''
        })
    }

    if (hasMax) {
        return t('event.price_sentence', {
            value: formatNumber(maxPrice),
            currency: currency ?? ''
        })
    }

    return null
}

export function formatEventPrice(
    t: (
        key: string,
        params?: Record<string, string | number | null | undefined>
    ) => string,
    locale: string,
    priceType: string | null | undefined,
    minPrice: number | null | undefined,
    maxPrice: number | null | undefined,
    currency: string | null | undefined
): string | null {
    if (priceType === 'free') {
        return t('event.price_free')
    }

    if (priceType === 'donation') {
        return t('event.price_donation')
    }

    return formatPrice(
        t,
        locale,
        minPrice,
        maxPrice,
        currency
    )
}
