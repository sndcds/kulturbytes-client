<template>
  <div>
    <button
        type="button"
        class="kbts-events-save-filter"
        @click="saveFilter"
    >
      Save Filter
    </button>

    <EventsView />
  </div>
</template>

<script setup lang="ts">
import EventsView from '~/components/event/EventsView.vue'
import { useFiltersStore } from "~/stores/filtersStore";

const BASE62_ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const filtersStore = useFiltersStore()
const { setFilter } = filtersStore
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

setFilter('events')
applyFilterFromQuery()

defineI18nRoute({
  paths: {
    de: '/veranstaltungen',
    da: '/begivenheder',
    en: '/events'
  }
})

definePageMeta({
  filters: true
})

onUnmounted(() => {
  setFilter(null)
})

function encodeBase62(value: string) {
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

function decodeBase62(value: string) {
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

function applyFilterFromQuery() {
  const filter =
      Array.isArray(route.query.filter)
          ? route.query.filter[0]
          : route.query.filter

  if (!filter) {
    return
  }

  try {
    const decodedFilter = decodeBase62(filter)
    const payload = JSON.parse(decodedFilter)
    filtersStore.applyEventFilterPayload(payload)
  } catch (error) {
    console.error('Failed applying event filter from query:', error)
  }
}

async function saveFilter() {
  const payload = filtersStore.buildEventFilterPayload()
  const encodedFilter = encodeBase62(JSON.stringify(payload))

  await router.push({
    path: localePath('events'),
    query: {
      ...route.query,
      filter: encodedFilter,
    },
  })
}
</script>

<style scoped>
.kbts-events-save-filter {
  margin: 1rem;
}
</style>
