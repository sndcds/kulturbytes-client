<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({
  title: computed(() =>
      isNotFound.value
          ? t('error.not_found_title')
          : t('error.generic_description')
  )
})

function goHome() {
  clearError({
    redirect: localePath('/')
  })
}
</script>

<template>
  <NuxtLayout name="default">
    <article class="kbts-html error-page">

      <img
          src="/icons/pippa.svg"
          alt=""
          class="error-icon"
      />

      <h1>{{ props.error.statusCode || 500 }}</h1>

      <h2 v-if="isNotFound">
        {{ t('error.not_found_title') }}
      </h2>

      <p v-if="isNotFound">
        {{ t('error.not_found_description') }}
      </p>

      <p v-else>
        {{ t('error.generic_description') }}
      </p>

      <button @click="goHome" class="kbts-button">
        {{ t('error.back_home') }}
      </button>
    </article>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.error-page {
  text-align: center;

  .error-icon {
    display: block;
    width: 8rem;
    height: auto;
    margin: 0 auto 1rem;
  }
}

</style>