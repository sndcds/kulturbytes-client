const BASE62_ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function encodeEventFilter(value: string) {
  const bytes = new TextEncoder().encode(value)
  let number = 0n

  for (const byte of bytes) {
    number = (number << 8n) + BigInt(byte)
  }

  if (number === 0n) {
    return BASE62_ALPHABET[0]
  }

  let encoded = ''
  const base = BigInt(BASE62_ALPHABET.length)

  while (number > 0n) {
    const remainder = Number(number % base)
    encoded = BASE62_ALPHABET[remainder] + encoded
    number = number / base
  }

  return encoded
}

function decodeEventFilter(value: string) {
  let number = 0n
  const base = BigInt(BASE62_ALPHABET.length)

  for (const character of value) {
    const index = BASE62_ALPHABET.indexOf(character)

    if (index === -1) {
      throw new Error('Invalid base62 filter value')
    }

    number = number * base + BigInt(index)
  }

  if (number === 0n) {
    return ''
  }

  const bytes: number[] = []

  while (number > 0n) {
    bytes.unshift(Number(number & 255n))
    number = number >> 8n
  }

  return new TextDecoder().decode(new Uint8Array(bytes))
}

export function useEventFilterEncoding() {
  return {
    encodeEventFilter,
    decodeEventFilter,
  }
}
