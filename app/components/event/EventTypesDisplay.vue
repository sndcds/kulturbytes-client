<template>
  <div v-if="groupedTypes.length">
    <ul class="kbts-event-types-list">
      <li v-for="type in groupedTypes" :key="type.id">
        <span class="kbts-event-types-list__text">
          <strong>{{ type.name }}</strong>
          <template v-if="type.genres.length">
            {{ ' ' + type.genres.join(' / ') }}
          </template>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEventTypeStore } from '~/stores/eventTypesStore'

const { t, locale } = useI18n()
const eventTypeStore = useEventTypeStore()

onMounted(() => {
  eventTypeStore.fetchTypes()
})

interface EventType {
  type_id: number
  type_name: string
  genre_id: number
  genre_name: string
}

const props = withDefaults(
    defineProps<{
      eventTypes?: EventType[]
      showGenres?: boolean
    }>(),
    {
      eventTypes: () => [],
      showGenres: true,
    }
)

const groupedTypes = computed(() => {
  const groups = new Map<number, {
    id: number
    name: string
    genres: string[]
  }>()

  for (const item of props.eventTypes) {
    const type = eventTypeStore.getType(
        String(item.type_id),
        locale.value
    )

    const genre = props.showGenres && item.genre_id
        ? eventTypeStore.getGenre(
            String(item.type_id),
            String(item.genre_id),
            locale.value
        )
        : null

    let group = groups.get(item.type_id)

    if (!group) {
      group = {
        id: item.type_id,
        name: type?.name ?? String(item.type_id),
        genres: [],
      }

      groups.set(item.type_id, group)
    }

    if (
        genre?.name &&
        !group.genres.includes(genre.name)
    ) {
      group.genres.push(genre.name)
    }
  }

  return [...groups.values()]
})

const labels = computed(() => {
  return props.eventTypes.map(item => {
    const type = eventTypeStore.getType(
        String(item.type_id),
        locale.value
    )
    const genre = item.genre_id
        ? eventTypeStore.getGenre(
            String(item.type_id),
            String(item.genre_id),
            locale.value
        )
        : null
    return {
      type: type?.name,
      genre: genre?.name,
    }
  })
})
</script>
