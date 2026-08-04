<template>
  <div class="kbts-articles-grid">
    <div class="kbts-article kbts-article-hero">
      <div class="kbts-article-content">
        <h1>{{ t('home.discover.title') }}</h1>

        <p style="font-size: 1.4rem; margin-top: 1rem;">
          {{ t('home.discover.text') }}
        </p>

        <NuxtLink :to="localePath('events')" class="button">
          {{ t('goto.events_page') }}
        </NuxtLink>
      </div>
    </div>

    <div class="kbts-article">
      <div class="kbts-article-content">
        <h2>{{ t('home.create.title') }}</h2>

        <div class="button-row">
          <a
              href="https://app.kulturbytes.de/app/signup"
              target="_blank"
              rel="noopener noreferrer"
              class="button small"
          >
            {{ t('goto.register') }}
          </a>

          <a
              href="https://app.kulturbytes.de/app/login"
              target="_blank"
              rel="noopener noreferrer"
              class="button small"
          >
            {{ t('goto.login') }}
          </a>
        </div>

        <p>{{ t('home.create.text') }}</p>
      </div>
    </div>

    <div class="kbts-article">
      <div class="kbts-article-content">
        <h2>{{ t('home.find.title') }}</h2>

        <div class="button-row">
          <NuxtLink :to="localePath('events-countries')" class="button small">
            {{ t('goto.country_list') }}
          </NuxtLink>
        </div>

        <p>{{ t('home.find.text') }}</p>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
const localePath = useLocalePath()
const { locale, t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
import { truncateText } from '~/utils/text'
import { ogLocale } from '~/utils/locale'

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

useHead(() => headData.value)

useSeoMeta({
  title: pageTitle.value,
  description: description.value,

  ogSiteName: t('siteName'),
  ogLocale: ogLocale(locale.value),

  ogTitle: pageTitle.value,
  ogDescription: truncateText(description.value, 160),

  ogUrl: pageUrl.value,
  ogType: 'website',
  ogImage: `${config.public.siteUrl}/images/social/kulturbytes.webp`,
  ogImageWidth: '1200',
  ogImageHeight: '675',
  ogImageAlt: event.value?.images?.main?.alt || event.value?.title,

  // twitterSite: '@kulturbytes', TODO:
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle.value,
  twitterDescription: truncateText(description.value),
  twitterImage: `${config.public.siteUrl}/images/social/kulturbytes.webp`,

  robots: event.value ? 'index,follow' : 'noindex'
})

</script>


<style scoped lang="scss">
.button {
  font-size: 1.2rem;
  padding: .8rem 1.6rem;
  border-radius: 99px;
  color: var(--kbts-fg);
  border: 2px solid var(--kbts-fg);
  margin-top: 2rem;

  &:hover {
    color: var(--kbts-bg);
    background: var(--kbts-fg);
  }
}

.button.small {
  font-size: 1rem;
  padding: .4rem .8rem;
  border-width: 1px;
}

.button-row {
  display: flex;
  gap: .5rem;
}

.kbts-articles-grid {
  display: grid;
  gap: 1rem;
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