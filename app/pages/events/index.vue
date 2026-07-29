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
