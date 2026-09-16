import { describe, expect, it } from 'vitest'
import { useCountryName } from '../../app/composables/useCountryName'

const { countryName } = useCountryName()

describe('native country names', () => {
  it.each([
    ['DEU', 'Deutschland'], ['dnk', 'Danmark'], ['AUT', 'Österreich'], ['GBR', 'United Kingdom'],
    ['xyz', 'XYZ'], ['', null], [null, null], [undefined, null],
  ])('resolves %s without inventing unknown names', (code, expected) => {
    expect(countryName(code)).toBe(expected)
  })
})
