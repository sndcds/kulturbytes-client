import {
    formatDate as _formatDate,
    formatTimeStr as _formatTimeStr,
    formatTimeRangeStr as _formatTimeRange,
    type DateFormatMode
} from '~/utils/formatDate'

export function useDateFormatter() {
    const { locale, t } = useI18n()

    return {
        formatDateStr: (
            date: string | null,
            mode: DateFormatMode = 'short'
        ) => _formatDate(locale.value, date, mode),

        formatTimeStr: (time: string | null) =>
            _formatTimeStr(t, locale.value, time),

        formatTimeRangeStr: (
            start: string | null,
            end?: string | null
        ) => _formatTimeRange(t, locale.value, start, end)
    }
}