<template>
  <div>
    <h1>Test page</h1>

    <p>
      Slug: {{ slug }}
    </p>

    <p>
      Locale: {{ locale }}
    </p>
  </div>
</template>

<script setup lang="ts">

defineI18nRoute({
  paths: {
    de: '/test/[slug]',
    da: '/test/[slug]',
    en: '/test/[slug]'
  }
})

const route = useRoute()
const { locale } = useI18n()

const slug = computed(() => route.params.slug as string)

</script>