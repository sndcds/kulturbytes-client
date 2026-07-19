<template>
  <div class="layout">

    <AppNavigation>
      <template #filters>
        <slot name="filters" />
      </template>
    </AppNavigation>

    <div class="map-layout">
      <slot />
    </div>

  </div>
</template>

<style scoped lang="scss">

.layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.map-layout {
  display:flex;
  flex-direction:column;
  width:100%;
  height: calc(100vh - 66px);
  overflow:hidden;
}

.map-layout > * {
  flex:1;
  min-height:0;
}
</style>