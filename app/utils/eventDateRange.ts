import type { EventsDateRangeMode } from '~/types/eventItem'

export type PresetDateRangeMode = Exclude<EventsDateRangeMode, 'custom'>

export const presetDateRangeModes: PresetDateRangeMode[] = [
    'all',
    'today',
    'tomorrow',
    'weekend',
    'next_week',
    'weekend_after'
]

function formatDateInputValue(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
}

export function resolveEventDateRange(mode: PresetDateRangeMode) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (mode === 'today') {
        return {
            startDate: formatDateInputValue(today),
            endDate: formatDateInputValue(today)
        }
    }

    if (mode === 'tomorrow') {
        const tomorrow = addDays(today, 1)

        return {
            startDate: formatDateInputValue(tomorrow),
            endDate: formatDateInputValue(tomorrow)
        }
    }

    if (mode === 'weekend') {
        const currentWeekday = today.getDay()

        let friday: Date

        if (currentWeekday === 0) {
            // Sunday → previous Friday
            friday = addDays(today, -2)
        } else if (currentWeekday === 6) {
            // Saturday → previous Friday
            friday = addDays(today, -1)
        } else {
            // Monday-Friday → upcoming Friday
            const daysUntilFriday = (5 - currentWeekday + 7) % 7
            friday = addDays(today, daysUntilFriday)
        }

        const sunday = addDays(friday, 2)

        return {
            startDate: formatDateInputValue(friday),
            endDate: formatDateInputValue(sunday)
        }
    }

    if (mode === 'next_week') {
        const daysUntilNextMonday = ((8 - today.getDay()) % 7) || 7
        const nextMonday = addDays(today, daysUntilNextMonday)

        return {
            startDate: formatDateInputValue(nextMonday),
            endDate: formatDateInputValue(addDays(nextMonday, 6))
        }
    }

    if (mode === 'weekend_after') {
        const currentWeekday = today.getDay()

        const daysUntilFriday = (5 - currentWeekday + 7) % 7
        const thisFriday = addDays(today, daysUntilFriday)

        const friday = addDays(thisFriday, 7)
        const sunday = addDays(friday, 2)

        return {
            startDate: formatDateInputValue(friday),
            endDate: formatDateInputValue(sunday)
        }
    }

    // mode === 'all'
    return {
        startDate: formatDateInputValue(today),
        endDate: ''
    }
}

export function inferEventDateRangeMode(
    startDate: string | null | undefined,
    endDate: string | null | undefined
): EventsDateRangeMode {
    const normalizedStartDate = startDate ?? ''
    const normalizedEndDate = endDate ?? ''

    if (!normalizedStartDate && !normalizedEndDate) {
        return 'all'
    }

    const matchingMode = presetDateRangeModes.find((mode) => {
        const range = resolveEventDateRange(mode)

        return (
            range.startDate === normalizedStartDate &&
            range.endDate === normalizedEndDate
        )
    })

    return matchingMode ?? 'range'
}