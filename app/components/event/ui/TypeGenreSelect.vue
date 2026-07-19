<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEventTypeStore } from '~/stores/eventTypesStore'
import { useEventSummaryStore } from '~/stores/eventSummaryStore'
import { useFiltersStore } from '~/stores/filtersStore'

const filtersStore = useFiltersStore()
const eventTypeStore = useEventTypeStore()
const eventSummaryStore = useEventSummaryStore()

const { locale } = useI18n()

const {
  typeSummary,
  genreSummary
} = storeToRefs(eventSummaryStore)

const {
  eventTypeIds,
  eventGenreIds
} = storeToRefs(filtersStore)

onMounted(async () => {
  await Promise.all([
    eventTypeStore.fetchTypes(),
    eventSummaryStore.loadSummary()
  ])
})

/*
 Single source of truth:
 The UI reads/writes directly to Pinia
*/

const selectedTypeId = computed({
  get() {
    return eventTypeIds.value[0] ?? null
  },

  set(id: string | null) {
    eventTypeIds.value = id ? [id] : []
  }
})

const selectedGenreIds = computed({
  get() {
    return eventGenreIds.value
  },

  set(ids: string[]) {
    eventGenreIds.value = ids
  }
})

const types = computed(() =>
    eventTypeStore.getTypes(locale.value)
)

const selectedType = computed(() =>
    selectedTypeId.value
        ? eventTypeStore.getType(
            selectedTypeId.value,
            locale.value
        )
        : undefined
)

const visibleTypes = computed(() => {
  if (!selectedTypeId.value) {
    return types.value
  }

  return types.value.filter(
      type => type.id === selectedTypeId.value
  )
})

function selectType(id: string) {
  if (selectedTypeId.value === id) {
    // clear type
    selectedTypeId.value = null
    // clear genres
    selectedGenreIds.value = []
  } else {
    selectedTypeId.value = id
    // changing type resets genres
    selectedGenreIds.value = []
  }
}

function toggleGenre(id: string) {
  if (selectedGenreIds.value.includes(id)) {
    selectedGenreIds.value =
        selectedGenreIds.value.filter(
            genreId => genreId !== id
        )
  } else {
    selectedGenreIds.value = [
      ...selectedGenreIds.value,
      id
    ]
  }
}

function isSelected(id: string) {
  return selectedGenreIds.value.includes(id)
}

const typeCountMap = computed(() =>
    Object.fromEntries(
        typeSummary.value.map(x => [
          x.id,
          x.count
        ])
    )
)

const genreCountMap = computed(() =>
    Object.fromEntries(
        genreSummary.value.map(x => [
          x.id,
          x.count
        ])
    )
)

function getTypeCount(id: string) {
  return typeCountMap.value[Number(id)] ?? 0
}

function getGenreCount(id: string) {
  return genreCountMap.value[Number(id)] ?? 0
}

watch(locale, () => {
  selectedTypeId.value = null
  selectedGenreIds.value = []
})
</script>


<template>
  <div class="event-type-filter">
    <div class="kbts-chip-container">
      <button
          v-for="type in visibleTypes"
          :key="type.id"
          class="kbts-chip"
          :class="{
            active: selectedTypeId === type.id
          }"
          @click="selectType(type.id)"
      >
        {{ type.name }}
        <span
            v-if="getTypeCount(type.id) > 0"
            class="chip-count"
        >
          {{ getTypeCount(type.id) }}
        </span>
      </button>
    </div>

    <div
        v-if="selectedType"
        class="kbts-chip-container genres"
    >
      <button
          v-for="genre in selectedType.genres"
          :key="genre.id"
          class="kbts-chip"
          :class="{
            active: isSelected(genre.id)
          }"
          @click="toggleGenre(genre.id)"
      >
        {{ genre.name }}
        <span
            v-if="getGenreCount(genre.id) > 0"
            class="chip-count"
        >
          {{ getGenreCount(genre.id) }}
        </span>
      </button>
    </div>
  </div>
</template>


<style scoped lang="scss">
.genres {
  margin-top: 1rem;
}

.chip-count {
  margin-left: .5rem;
  padding-left: .5rem;
  border-left: 1px solid currentColor;
}
</style>