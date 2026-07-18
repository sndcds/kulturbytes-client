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

<style scoped lang="scss">
.layout {
  min-height: 100vh;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>