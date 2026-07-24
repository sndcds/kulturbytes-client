<template>
  <ul
      v-if="labels.length"
      class="kbts-language-list"
  >
    <li
        v-for="language in labels"
        :key="language.id"
        class="kbts-language-list__item"
    >
      {{ language.name }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLanguageLookupStore } from '~/stores/languageLookupStore'

const { locale } = useI18n()

const languageStore = useLanguageLookupStore()

const props = withDefaults(
    defineProps<{
      languages?: string[]
    }>(),
    {
      languages: () => [],
    }
)

onMounted(() => {
  languageStore.fetchLanguages(locale.value)
})

const labels = computed(() => {
  return props.languages
      .map(id => {
        const language = languageStore.getLanguage(
            id,
            locale.value
        )

        return language
            ? {
              id,
              name: language.name,
            }
            : null
      })
      .filter(Boolean) as {
    id: string
    name: string
  }[]
})
</script>

<style scoped>
.kbts-language-list {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;

  padding: 0;
  margin: 0;

  list-style: none;
}

.kbts-language-list__item {
  display: inline-flex;
  align-items: center;

  padding: .25rem .6rem;

  border-radius: 4px;

  background: var(--kbts-surface);
  border: 1px solid var(--kbts-border);

  font-size: .875rem;
  line-height: 1.2;
}
</style>