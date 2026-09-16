import { describe, expect, it } from 'vitest'
import { useEventFilterEncoding } from '../../app/composables/useEventFilterEncoding'
import { cleanObject } from '../../app/utils/cleanObject'

const { encodeEventFilter, decodeEventFilter } = useEventFilterEncoding()

describe('shared event filter URLs', () => {
  it('keeps the existing base62 wire format', () => {
    expect(encodeEventFilter('')).toBe('0')
    expect(decodeEventFilter('0')).toBe('')
    expect(encodeEventFilter('A')).toBe('13')
    expect(decodeEventFilter('13')).toBe('A')
  })

  it.each([
    {},
    { categories: [1] },
    { categories: [1, 3], types: [2], genres: [4, 5], date: { start: '2026-09-10' } },
    { search: 'Kultur & Musik: Sønderborg, 日本 🎭' },
  ])('round-trips a filter payload: %j', (payload) => {
    const encoded = encodeEventFilter(JSON.stringify(payload))
    expect(encoded).toMatch(/^[0-9A-Za-z]+$/)
    expect(JSON.parse(decodeEventFilter(encoded))).toEqual(payload)
  })

  it.each(['!', '12-3', 'a b', 'ø', '0/'])('rejects malformed base62: %s', (value) => {
    expect(() => decodeEventFilter(value)).toThrow('Invalid base62 filter value')
  })

  it('removes empty nested filters while preserving zero and false', () => {
    const payload = {
      categories: [],
      search: '  Konzert  ',
      date: { start: '', end: null },
      location: { city: ' Flensburg ', useCurrentLocation: false },
      age: { from: 0, to: undefined },
    }
    const cleaned = cleanObject(payload)
    expect(JSON.parse(decodeEventFilter(encodeEventFilter(JSON.stringify(cleaned))))).toEqual({
      search: 'Konzert',
      location: { city: 'Flensburg', useCurrentLocation: false },
      age: { from: 0 },
    })
    expect(payload.search).toBe('  Konzert  ')
  })

  it('omits completely empty payloads', () => {
    expect(cleanObject({ categories: [], date: { start: '', end: null } })).toBeUndefined()
  })
})
