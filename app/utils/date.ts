export function getStartDateTime(
  startDate?: string | null,
  startTime?: string | null,
): Date | null {
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null

  const [year = 0, month = 0, day = 0] = startDate.split('-').map(Number)

  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(year, month - 1, day)

  // Date normalizes impossible calendar dates, so verify the parsed parts.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null

  if (startTime) {
    if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/.test(startTime)) {
      return null
    }

    const [hours = 0, minutes = 0] = startTime
      .split(':')
      .map(Number)

    date.setHours(hours, minutes, 0, 0)
  }

  return date
}
