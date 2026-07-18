// utils/formatDate.ts

export type DateFormatMode = 'numeric' | 'short' | 'long' | 'weekday'

export function formatDate(
    locale: string,
    date: string | null,
    mode: DateFormatMode = 'short'
): string {
    if (!date) return ''

    const parts = date.split('-')

    if (parts.length !== 3) return ''

    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day)
    ) {
        return ''
    }

    const localDate = new Date(year, month - 1, day)

    const options: Intl.DateTimeFormatOptions =
        mode === 'long'
            ? {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
            : mode === 'weekday'
                ? {
                    weekday: 'short',
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                }
                : mode === 'numeric'
                    ? {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                    }
                    : {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }

    return new Intl.DateTimeFormat(locale, options).format(localDate)
}

export function formatTime(
    locale: string,
    time: string | null
) {
    if (!time) return null
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(`2000-01-01T${time}`))
}

export function formatTimeStr(
    t: (key: string, params?: Record<string, unknown>) => string,
    locale: string,
    time: string | null
) {
    const timeStr = formatTime(locale, time)
    if (!t) return null
    return t('time.time', { time: timeStr })
}

export function formatTimeRangeStr(
    t: (key: string, params?: Record<string, unknown>) => string,
    locale: string,
    start: string | null,
    end?: string | null
) {
    const startTime = formatTime(locale, start)
    if (end) {
        const endTime = formatTime(locale, end)
        return t('time.range', { start: startTime, end: endTime })
    }
    return t('time.time', { time: startTime })
}