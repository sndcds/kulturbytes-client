<template>
  <h1>Index</h1>

  <div class="container">
    <NuxtLink
        :to="localePath('/events/')"
        class="button"
    >
      {{ t(`events`) }}
    </NuxtLink>

    <NuxtLink
        :to="localePath('/eventlist')"
        class="button"
    >
      {{ t(`eventlist`) }}
    </NuxtLink>
  </div>
</template>


<script setup lang="ts">
const localePath = useLocalePath()
const { locale, t } = useI18n()
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