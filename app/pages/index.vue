<template>
  <h1>Index</h1>

  <div class="container">
    <NuxtLink
        :to="localePath('/events/')"
        class="button"
    >
      Events
    </NuxtLink>

    <NuxtLink
        :to="localePath('/eventlist')"
        class="button"
    >
      Event list
    </NuxtLink>
  </div>
</template>


<script setup lang="ts">
const localePath = useLocalePath()
const { locale, t } = useI18n()

const title = computed(() =>
    t('home.title', 'Kulturbytes – Events und Kultur entdecken')
)

const description = computed(() =>
    t(
        'home.description',
        'Entdecke Veranstaltungen, Konzerte und kulturelle Angebote in deiner Region.'
    )
)

useHead({
  htmlAttrs: {
    lang: locale
  },
  title
})

useSeoMeta({
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary',
  twitterTitle: title,
  twitterDescription: description
})
</script>


<style scoped>
.container {
  display: flex;
  gap: .5rem;
}

.button {
  padding: .6rem 1.2rem;
  background: palegreen;
}
</style>