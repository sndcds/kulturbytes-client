import { describe, expect, it, vi } from 'vitest'
import { getStartDateTime } from '../../app/utils/date'
import { formatDate, formatTime, formatTimeRangeStr, formatTimeStr } from '../../app/utils/formatDate'

describe('API calendar dates', () => {
  it('parses dates in local calendar time, including leap days', () => {
    const date = getStartDateTime('2024-02-29', '19:30:45.123456')!
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()])
      .toEqual([2024, 1, 29, 19, 30])
  })

  it('accepts a date without inventing a displayed time', () => {
    expect(getStartDateTime('2026-09-10')?.getHours()).toBe(0)
    expect(formatTime('de', null)).toBeNull()
  })

  it.each([null, undefined, '', 'invalid', '2025-02-29', '2026-04-31', '2026-13-01', '2026-00-10', '2026-09-00', '2026-9-10'])
  ('rejects invalid dates: %s', (date) => {
    expect(getStartDateTime(date)).toBeNull()
    expect(formatDate('de', date)).toBe('')
  })

  it.each(['24:00', '12:60', '12:30:60', '9:00', '12:30Z', 'invalid'])('rejects invalid times: %s', (time) => {
    expect(getStartDateTime('2026-09-10', time)).toBeNull()
    expect(formatTime('de', time)).toBeNull()
  })

  it.each([
    ['de', '10.09.26'],
    ['da', '10.09.26'],
    ['en', '09/10/26'],
  ])('formats calendar dates for %s', (locale, expected) => {
    expect(formatDate(locale, '2026-09-10', 'numeric')).toBe(expected)
  })

  it('does not render translation labels for absent or invalid start times', () => {
    const t = vi.fn(() => 'label')
    expect(formatTimeStr(t, 'de', null)).toBeNull()
    expect(formatTimeRangeStr(t, 'de', 'invalid', '21:00')).toBeNull()
    expect(t).not.toHaveBeenCalled()
  })

  it('passes localized times to the correct translation key', () => {
    const t = vi.fn(() => 'localized label')
    expect(formatTimeRangeStr(t, 'de', '19:30', '21:00')).toBe('localized label')
    expect(t).toHaveBeenLastCalledWith('time.range', { start: '19:30', end: '21:00' })
    formatTimeRangeStr(t, 'de', '19:30', null)
    expect(t).toHaveBeenLastCalledWith('time.time', { time: '19:30' })
  })
})
