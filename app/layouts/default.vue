<template>
  <div class="layout">

    <AppNavigation>
      <template #filters>
        <slot name="filters" />
      </template>
    </AppNavigation>

    <main>
      <slot />
    </main>

  </div>
</template>


<script setup lang="ts">
const { organization, website } = useStructuredData()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          organization,
          website
        ]
      })
    }
  ]
})
</script>


<style scoped lang="scss">
.layout {
  min-height: 100vh;
  width: 100vw;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>