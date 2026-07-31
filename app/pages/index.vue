<template>
  <pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br>
  <pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br>

  <h1>Index</h1>

  <div class="container">
    <NuxtLink
        :to="localePath('events')"
        class="button"
    >
      Events
    </NuxtLink>

    <NuxtLink
        :to="localePath('events-countries')"
        class="button"
    >
      Event list
    </NuxtLink>
  </div>
</template>


<script setup lang="ts">
const localePath = useLocalePath()
const { locale, t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const pageUrl = computed(
    () => `${config.public.siteUrl}${route.fullPath}`
)

const pageTitle = computed(
    () => `${t('home.title')}`
)

const description = computed(
    () => t('home.seo.description')
)

const headData = computed(() => ({
  htmlAttrs: {
    lang: locale.value
  },
  title: pageTitle.value,
  link: [
    {
      rel: 'canonical',
      href: pageUrl.value
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": t('siteName'),
        "url": config.public.siteUrl,
        "description": description.value,
        "inLanguage": locale.value
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": t('siteName'),
        "url": config.public.siteUrl
      })
    }
  ]
}))

const seoData = computed(() => ({
  title: pageTitle.value,
  description: description.value,

  ogTitle: pageTitle.value,
  ogDescription: description.value,
  ogImage: `${config.public.siteUrl}/images/social/kulturbytes.webp`,
  ogType: 'website',
  ogUrl: pageUrl.value,

  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: description.value,
  twitterImage: `${config.public.siteUrl}/images/social/kulturbytes.webp`,

  robots: 'index,follow'
}))

useHead(() => headData.value)
useSeoMeta(() => seoData.value)

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