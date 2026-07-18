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
import { computed } from 'vue'

const { t } = useI18n()

interface EventType {
  type_id: number
  type_name: string
  genre_id: number
  genre_name: string
}

const props = withDefaults(
    defineProps<{
      eventTypes?: EventType[]
    }>(),
    {
      eventTypes: () => [],
    }
)

const groupedTypes = computed(() => {
  const groups = new Map<number, {
    id: number
    name: string
    genres: string[]
  }>()

  for (const item of props.eventTypes) {
    let group = groups.get(item.type_id)

    if (!group) {
      group = {
        id: item.type_id,
        name: item.type_name,
        genres: [],
      }

      groups.set(item.type_id, group)
    }

    if (
        item.genre_name &&
        !group.genres.includes(item.genre_name)
    ) {
      group.genres.push(item.genre_name)
    }
  }

  return [...groups.values()]
})
</script>
