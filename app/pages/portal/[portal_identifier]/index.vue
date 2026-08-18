<template>
  <div
      v-if="portal"
      class="kbts-venue-view-layout"
  >
    <div class="kbts-venue-view-column kbts-venue-view-column-left">
      <div
          v-if="portal.main_image_url"
          class="kbts-venue-view-image"
      >
        <div class="kbts-venue-view-image-outer">
          <div
              class="kbts-venue-view-image-inner"
              :style="{
                backgroundImage: `url(${imageUrl(portal.main_image_url, 960, '16:9')})`
              }"
              role="img"
              :aria-label="portal.name"
          />
        </div>
      </div>

      <div class="kbts-venue-view-content">
        <h1 class="kbts-venue-view-title">
          {{ portal.name }}
        </h1>

        <div
            class="kbts-venue-description"
            v-html="descriptionHtml"
        />
      </div>
    </div>

    <div class="kbts-venue-view-column kbts-venue-view-column-right">
      <LogoImage
          v-if="portal.web_logo_url"
          class="kbts-venue-view-logo"
          :main-src="portal.web_logo_url"
          :theme="themeStore.theme"
          :alt="portal.name"
          :pixel-count="240 * 120"
          :max-width="240"
          :max-height="200"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoImage from '~/components/ui/LogoImage.vue'
import { useThemeStore } from '~/stores/themeStore'
import { imageUrl } from '~/utils/image'
import { ogLocale } from '~/utils/locale'
import { truncateText } from '~/utils/text'

defineI18nRoute({
  paths: {
    de: '/portal/[portal_identifier]',
    da: '/portal/[portal_identifier]',
    en: '/portal/[portal_identifier]'
  }
})

definePageMeta({
  filters: false,
})

const route = useRoute()
const config = useRuntimeConfig()
const { locale, t } = useI18n()
const { renderMarkdown } = useMarkdown()
const { activatePortal } = usePortal()
const themeStore = useThemeStore()

const portalUuid = computed(() => {
  const value = route.params.portal_identifier
  return Array.isArray(value) ? value[0] ?? '' : value?.toString() ?? ''
})

if (!portalUuid.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Portal not found',
    fatal: true,
  })
}

const { data: portal, error } = await useAsyncData(
    () => `portal-${portalUuid.value}`,
    () => activatePortal(portalUuid.value),
    {
      watch: [portalUuid],
    }
)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 500,
    statusMessage: error.value.statusMessage ?? 'Failed to load portal',
    fatal: true,
  })
}

const descriptionHtml = computed(() =>
    renderMarkdown(portal.value?.description ?? '')
)
const canonicalUrl = computed(() =>
    new URL(route.path, config.public.siteUrl).href
)
const description = computed(() =>
    truncateText(portal.value?.description, 160)
)
const seoImage = computed(() =>
    portal.value?.main_image_url
        ? imageUrl(portal.value.main_image_url, 1200, '16:9')
        : undefined
)

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
}))

useSeoMeta({
  title: computed(() => portal.value?.name),
  description,

  ogType: 'website',
  ogSiteName: computed(() => t('siteName')),
  ogLocale: computed(() => ogLocale(locale.value)),
  ogTitle: computed(() => portal.value?.name),
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogImage: seoImage,
  ogImageWidth: '1200',
  ogImageHeight: '675',
  ogImageAlt: computed(() => portal.value?.name),

  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => portal.value?.name),
  twitterDescription: description,
  twitterImage: seoImage,

  robots: computed(() => portal.value ? 'index,follow' : 'noindex'),
})
</script>
