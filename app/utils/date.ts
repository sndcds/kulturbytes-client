export function getStartDateTime(
  startDate?: string | null,
  startTime?: string | null,
): Date | null {
  if (!startDate) return null

  const [year, month, day] = startDate.split('-').map(Number)

  const date = new Date(
      year as number, (month as number - 1), day,
      0, 0, 0, 0
  )

  if (startTime) {
    const [hours = 0, minutes = 0] = startTime
      .split(':')
      .map(Number)

    date.setHours(hours, minutes, 0, 0)
  }

  return date
}