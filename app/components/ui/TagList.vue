<template>
  <ul
      v-if="tags.length"
      class="kbts-tag-list"
  >
    <li
        v-for="tag in tags"
        :key="tag"
        class="kbts-tag-list__item"
    >
      #{{ tag }}
    </li>
  </ul>
</template>

<script setup lang="ts">

const props = withDefaults(
    defineProps<{
      tags?: string[]
    }>(),
    {
      tags: () => [],
    }
)

const tags = computed(() => props.tags)

</script>
