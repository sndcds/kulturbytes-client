<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useEventTypeStore } from '~/stores/eventTypesStore'
import { useEventSummaryStore } from '~/stores/eventSummaryStore'

const emit = defineEmits<{
  change: [
    {
      typeIds: string[]
      genreIds: string[]
    }
  ]
}>()

const eventTypeStore = useEventTypeStore()

const selectedTypeId = ref<string | null>(null)
const selectedGenreIds = ref<string[]>([])

const { locale } = useI18n()
const filtersStore = useFiltersStore()
const eventSummaryStore = useEventSummaryStore()

const {
  typeSummary,
  genreSummary
} = storeToRefs(eventSummaryStore)

onMounted(async () => {
  await Promise.all([
    eventTypeStore.fetchTypes(),
    eventSummaryStore.loadSummary()
  ])

  selectedTypeId.value =
      filtersStore.eventTypeIds[0] ?? null

  selectedGenreIds.value =
      [...filtersStore.eventGenreIds]
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
    // unselect current type
    selectedTypeId.value = null
    selectedGenreIds.value = []
  } else {
    selectedTypeId.value = id
    selectedGenreIds.value = []
  }

  emitChange()
}

function toggleGenre(id: string) {
  if (selectedGenreIds.value.includes(id)) {
    selectedGenreIds.value =
        selectedGenreIds.value.filter(
            genreId => genreId !== id
        )
  } else {
    selectedGenreIds.value.push(id)
  }

  emitChange()
}

function emitChange() {
  const payload = {
    typeIds: selectedTypeId.value
        ? [selectedTypeId.value]
        : [],
    genreIds: [...selectedGenreIds.value],
  }
  filtersStore.setEventTypes(payload)
  emit("change", payload)
}

function isSelected(id: string) {
  return selectedGenreIds.value.includes(id)
}

const typeCountMap = computed(() =>
    Object.fromEntries(
        typeSummary.value.map(x => [x.id, x.count])
    )
)

const genreCountMap = computed(() =>
    Object.fromEntries(
        genreSummary.value.map(x => [x.id, x.count])
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
          :class="{ active: selectedTypeId === type.id }"
          @click="selectType(type.id)"
      >
        {{ type.name }}
        <span v-if="getTypeCount(type.id) > 0" class="chip-count">
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
          :class="{ active: isSelected(genre.id) }"
          @click="toggleGenre(genre.id)"
      >
        {{ genre.name }}
          <span v-if="getGenreCount(genre.id) > 0" class="chip-count">
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