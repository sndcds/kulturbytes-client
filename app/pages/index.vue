<script setup lang="ts">
</script>

<template>
  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre><br-->
  <!--pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre><br-->

  <div class="kbts-articles-grid">

    <div class="kbts-article kbts-article-hero" style="color: mediumblue; background-color: transparent;">
      <div class="kbts-article-content">

        <h1>
          Entdecken
        </h1>

        <p style="font-size: 1.4rem; margin-top: 1rem;">
          Es gibt unzählige Möglichkeiten, Kultur zu erleben.
          kulturbytes hilft dir dabei, Neues zu entdecken, zu stöbern oder gezielt das zu finden,
          was dich interessiert.
        </p>

        <NuxtLink
            :to="localePath('events')"
            class="button"
            style="color: mediumblue; border-color: mediumblue;"
        >
          {{ t('goto.events_page') }}
        </NuxtLink>

      </div>
    </div>


    <div class="kbts-article" style="color: mediumblue; background-color: transparent;">
      <div class="kbts-article-content">

        <h2>
          Für Kulturakteure
        </h2>

        <div class="button-row">
          <a
              href="https://app.kulturbytes.de/app/signup"
              target="_blank"
              rel="noopener noreferrer"
              class="button small"
              style="color: mediumblue; border-color: mediumblue;"
          >
            {{ t('goto.register') }}
          </a>

          <a
              href="https://app.kulturbytes.de/app/login"
              target="_blank"
              rel="noopener noreferrer"
              class="button small"
              style="color: mediumblue; border-color: mediumblue;"
          >
            {{ t('goto.login') }}
          </a>
        </div>

        <p>
          Du organisierst Veranstaltungen oder betreibst einen Kulturort?
          Mit einem kostenlosen Account kannst du deine Angebote auf kulturbytes veröffentlichen
          und für Besucherinnen und Besucher sichtbar machen.
        </p>

      </div>
    </div>

    <div class="kbts-article" style="color: mediumseagreen; background-color: transparent;">
      <div class="kbts-article-content">

        <h2>
          Grenzenlos
        </h2>

        <div class="button-row">
          <NuxtLink
              :to="localePath('events-countries')"
              class="button small"
              style="color: mediumseagreen; border-color: mediumseagreen;"
          >
            {{ t('goto.country_list') }}
          </NuxtLink>
        </div>

        <p>
          kulturbytes verbindet Veranstaltungen und Orte aus verschiedenen Regionen und Ländern.
          Entdecke, wo bereits Angebote zu finden sind und wohin die Plattform wächst.
        </p>

      </div>
    </div>

    <div class="kbts-article" style="color: lightcoral; background-color: transparent;">
      <div class="kbts-article-content">

        <h2>
          Offen + Gemeinsam
        </h2>

        <div class="button-row">
          <NuxtLink
              :to="localePath('events-countries')"
              class="button small"
              style="color: lightcoral; border-color: lightcoral;"
          >
            Code
          </NuxtLink>

          <NuxtLink
              :to="localePath('events-countries')"
              class="button small"
              style="color: lightcoral; border-color: lightcoral;"
          >
            Dokumentation
          </NuxtLink>
        </div>

        <p>
          kulturbytes ist eine offene Plattform, die von der Community entwickelt wird.
          Hier findest du Informationen zu unserem Open-Source-Projekt, dem Code und der Dokumentation.
        </p>

      </div>
    </div>

    <div class="kbts-article" style="color: lightcoral; background-color: transparent;">
      <div class="kbts-article-content">
        <h2>
          Unterstütze kulturbytes
        </h2>

        <div class="button-row">
          <NuxtLink
              :to="localePath('events-countries')"
              class="button small"
              style="color: lightcoral; border-color: lightcoral;"
          >
            Unterstützen
          </NuxtLink>
        </div>

        <p>
          kulturbytes lebt von Menschen, die sich einbringen.
          Hilf uns dabei, die Plattform weiter zu pflegen, zu verbessern
          und neue Funktionen zu entwickeln.
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


<style scoped lang="scss">
.button {
  font-size: 1.2rem;
  padding: .8rem 1.6rem;
  border-radius: 99px;
  color: mediumblue;
  border: 2px solid mediumblue;
  margin-top: 2rem;
}

.button.small {
  font-size: .9rem;
  padding: .4rem .8rem;
}

.button-row {
  display: flex;
  gap: .5rem;
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

  h1, h2 {
    font-size: 3rem;
    font-weight: 400;
    margin: 0;
  }

  h2 {
    font-size: 2rem;
  }

  p {
    line-height: 1.6;
    margin: 0;
  }

  .button {
    margin-bottom: 2rem !important;
  }
}

.kbts-article-hero {
  grid-column: span 2;
}

.kbts-article-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
}

@media (max-width: 900px) {
  .kbts-articles-grid {
    grid-template-columns: 1fr;
  }

  .kbts-article-hero {
    grid-column: span 1;
  }
}
</style>