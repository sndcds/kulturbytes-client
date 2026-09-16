// utils/formatDate.ts
import { getStartDateTime } from './date'

export type DateFormatMode = 'numeric' | 'short' | 'long' | 'weekday'

export function formatDate(
    locale: string,
    date: string | null | undefined,
    mode: DateFormatMode = 'short'
): string {
    const localDate = getStartDateTime(date)
    if (!localDate) return ''

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
    time: string | null | undefined
) {
    if (!time) return null

    const localTime = getStartDateTime('2000-01-01', time)
    if (!localTime) return null

    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit'
    }).format(localTime)
}

export function formatTimeStr(
    t: (key: string, params?: Record<string, unknown>) => string,
    locale: string,
    time: string | null | undefined
) {
    const timeStr = formatTime(locale, time)
    if (!timeStr) return null

    return t('time.time', { time: timeStr })
}

export function formatTimeRangeStr(
    t: (key: string, params?: Record<string, unknown>) => string,
    locale: string,
    start: string | null | undefined,
    end?: string | null
) {
    const startTime = formatTime(locale, start)
    if (!startTime) return null

    const endTime = formatTime(locale, end)

    if (endTime) {
        return t('time.range', {
            start: startTime,
            end: endTime
        })
    }

    return t('time.time', { time: startTime })
}

export function formatDateTime(
    locale: string,
    startDate: string | null | undefined,
    startTime: string | null | undefined,
    endDate: string | null | undefined,
    endTime: string | null | undefined
): string {
    const startDateStr = formatDate(locale, startDate, 'weekday')
    const startTimeStr = formatTime(locale, startTime)

    const start = [startDateStr, startTimeStr]
        .filter(Boolean)
        .join(' / ')

    // No end date, or end date is the same as start date
    if (!endDate || endDate === startDate) {
        if (endTime) {
            return `${start} – ${formatTime(locale, endTime)}`
        }

        return start
    }

    // Has a different end date
    const endDateStr = formatDate(locale, endDate, 'weekday')
    const endTimeStr = formatTime(locale, endTime)

    const end = [endDateStr, endTimeStr]
        .filter(Boolean)
        .join(' / ')

    return `${start} – ${end}`
}
