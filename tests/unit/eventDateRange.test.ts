import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { inferEventDateRangeMode, resolveEventDateRange } from '../../app/utils/eventDateRange'

describe('event calendar presets', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 11, 31, 12))
  })
  afterEach(() => vi.useRealTimers())

  it.each([
    ['all', '2026-12-31', ''],
    ['today', '2026-12-31', '2026-12-31'],
    ['tomorrow', '2027-01-01', '2027-01-01'],
    ['weekend', '2027-01-01', '2027-01-03'],
    ['next_week', '2027-01-04', '2027-01-10'],
    ['weekend_after', '2027-01-08', '2027-01-10'],
  ] as const)('resolves %s across the year boundary', (mode, startDate, endDate) => {
    expect(resolveEventDateRange(mode)).toEqual({ startDate, endDate })
    expect(inferEventDateRangeMode(startDate, endDate)).toBe(mode)
  })

  it.each([2, 3])('keeps the current weekend on January %i', (day) => {
    vi.setSystemTime(new Date(2027, 0, day, 12))
    expect(resolveEventDateRange('weekend')).toEqual({ startDate: '2027-01-01', endDate: '2027-01-03' })
  })

  it('recognizes empty and custom date ranges', () => {
    expect(inferEventDateRangeMode(null, undefined)).toBe('all')
    expect(inferEventDateRangeMode('2027-02-01', '2027-02-10')).toBe('range')
  })
})
