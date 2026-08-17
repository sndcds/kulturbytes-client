<template>
  <div class="layout">

    <NavigationAppNavigation>
      <template #filters>
        <slot name="filters" />
      </template>
    </NavigationAppNavigation>

    <div class="map-layout">
      <slot />
    </div>

  </div>
</template>


<script setup lang="ts">
const config = useRuntimeConfig()

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${config.public.siteUrl}/#organization`,
            "name": "DatenSindDaten e. V.",
            "url": config.public.siteUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${config.public.siteUrl}/images/dsd-logo-typo-black.svg`
            }
          },
          {
            "@type": "WebSite",
            "@id": `${config.public.siteUrl}/#website`,
            "name": "kulturbytes",
            "url": config.public.siteUrl,
            "publisher": {
              "@id": `${config.public.siteUrl}/#organization`
            }
          }
        ]
      })
    }
  ]
})
</script>


<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.map-layout {
  display:flex;
  flex-direction:column;
  width:100%;
  flex: 1;
  min-height: 0;
  overflow:hidden;
}

.map-layout > * {
  flex:1;
  min-height:0;
}

@media (max-width: 768px) {
  .layout {
    height: calc(
      100dvh
      - var(--kbts-mobile-nav-height)
      - env(safe-area-inset-bottom)
    );
    min-height: 0;
  }
}
</style>
