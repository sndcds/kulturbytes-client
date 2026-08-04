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
              "url": `${config.public.siteUrl}/images/kulturbytes-logo-typo-2-lines.svg`
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
  min-height: 100vh;
  width: 100vw;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>