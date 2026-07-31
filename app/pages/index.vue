<script setup lang="ts">
</script>
<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br-->
  <!--pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <div class="kbts-articles-grid">

    <div
        class="kbts-article" style="color: mediumblue; background-color: transparent;">
      <div class="kbts-article-content">
        <h1>
          Kultur entdecken
        </h1>

        <NuxtLink
            :to="localePath('events')"
            class="button"
        >
          {{ t('goto.events_page') }}
        </NuxtLink>

        <p>
          Kultur findet überall statt – in kleinen Initiativen, auf Bühnen, in Museen,
          Vereinen und an vielen besonderen Orten in deiner Region. kulturbytes macht
          diese Vielfalt sichtbar und lädt dazu ein, Veranstaltungen und kulturelle Angebote neu zu entdecken.
        </p>
      </div>
    </div>

    <div class="kbts-article" style="color: mediumseagreen; background-color: transparent;">
      <div class="kbts-article-content">
        <h1>
          Geo
        </h1>

        <NuxtLink
            :to="localePath('events-countries')"
            class="button"
            style="color: mediumseagreen; border-color: mediumseagreen;"
        >
          {{ t('goto.country_list') }}
        </NuxtLink>

        <p>
          Kostenlos, offen und gemeinschaftlich entwickelt: kulturbytes entsteht als
          Open-Source-Projekt von der Community für die Community.
        </p>
      </div>
    </div>

    <div class="kbts-article" style="color: lightcoral; background-color: transparent;">
      <div class="kbts-article-content">
        <h1>
          Community
        </h1>

        <NuxtLink
            :to="localePath('events-countries')"
            class="button"
            style="color: lightcoral; border-color: lightcoral;"
        >
          {{ t('goto.country_list') }}
        </NuxtLink>

        <p>
          Kostenlos, offen und gemeinschaftlich entwickelt: kulturbytes entsteht als
          Open-Source-Projekt von der Community für die Community.
        </p>

      </div>
    </div>

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
.button {
  font-size: 1.2rem;
  padding: .8rem 1.6rem;
  border-radius: 99px;
  color: mediumblue;
  border: 2px solid mediumblue;
  margin-top: 2rem;
}

.kbts-articles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.kbts-article {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--kbts-card-bg);
  border-radius: .5rem;
  padding: 1rem;

  h1 {
    font-size: 3rem;
    font-weight: 400;
    margin: 0;
  }

  p {
    line-height: 1.6;
    margin: 0;
  }

  .button {
    margin-bottom: 2rem !important;
  }
}

.kbts-article-content {
  display: flex;
  flex-direction: column;
  gap: 0rem;
  align-items: flex-start;
}
</style>