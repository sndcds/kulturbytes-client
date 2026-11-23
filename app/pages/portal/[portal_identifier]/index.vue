
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

      <div
          v-if="geometriesError"
          class="portal-geometries-error"
          role="status"
      >
        <p>{{ t('portal.geometries_error') }}</p>

        <button
            type="button"
            class="kbts-button"
            @click="refreshGeometries()"
        >
          {{ t('portal.retry') }}
        </button>
      </div>

      <!-- TODO: Importance high: Geometry selection by user! -->
      <!-- <PortalGeometrySelector
        v-else
        :geometry="portalGeometries?.geometry ?? null"
      /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import LogoImage from '~/components/ui/LogoImage.vue'

import { useThemeStore } from '~/stores/themeStore'
import { useFiltersStore } from '~/stores/filtersStore'

import type { ApiResponse } from '~/types/api'
import type { PortalGeometries } from '~/types/portal'

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


/* -------------------------------------------------------------------------- */
/* Dependencies                                                               */
/* -------------------------------------------------------------------------- */

const route = useRoute()
const config = useRuntimeConfig()

const { locale, t } = useI18n()
const { renderMarkdown } = useMarkdown()
const { activatePortal } = usePortal()

const { $api } = useNuxtApp()

const themeStore = useThemeStore()
const filtersStore = useFiltersStore()


/* -------------------------------------------------------------------------- */
/* Portal                                                                     */
/* -------------------------------------------------------------------------- */

const portalUuid = computed(() => {
  const value = route.params.portal_identifier

  return Array.isArray(value)
      ? value[0] ?? ''
      : value?.toString() ?? ''
})

if (!portalUuid.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Portal not found',
    fatal: true,
  })
}

const {
  data: portal,
  error: portalError,
} = await useAsyncData(
    () => `portal-${portalUuid.value}`,
    () => activatePortal(portalUuid.value)
)

if (portalError.value) {
  throw createError({
    statusCode: portalError.value.statusCode ?? 500,
    statusMessage: portalError.value.statusMessage ?? 'Failed to load portal',
    fatal: true,
  })
}


/* -------------------------------------------------------------------------- */
/* Portal geometry                                                            */
/* -------------------------------------------------------------------------- */

// Clear the previous selection whenever the portal changes.
watch(
    portalUuid,
    () => {
      filtersStore.setEventPortalGeometryUuid(null)
    }
)

const {
  data: portalGeometries,
  error: geometriesError,
  refresh: refreshGeometries,
} = await useAsyncData(
    () => `portal-geometries-${portal.value?.uuid ?? ''}`,
    async (_nuxtApp, { signal }) => {
      const uuid = portal.value?.uuid

      if (!uuid) {
        return { geometry: null }
      }

      const response = await $api<ApiResponse<PortalGeometries>>(
          `/api/portal/${encodeURIComponent(uuid)}/geometries`,
          { signal }
      )

      return response.data
    }
)

// Find the root geometry.
const rootGeometry = computed(() => {
  const geometries = portalGeometries.value?.geometry

  if (!Array.isArray(geometries)) {
    return null
  }

  return geometries.find(
      geometry => geometry.parent_uuid === null
  ) ?? null
})

// Set the root geometry whenever the page is entered or its data changes.
watch(
    [portalUuid, rootGeometry],
    ([, geometry]) => {
      filtersStore.setEventPortalGeometryUuid(
          geometry?.uuid ?? null
      )
    },
    { immediate: true }
)


/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const descriptionHtml = computed(() =>
    renderMarkdown(portal.value?.description ?? '')
)


/* -------------------------------------------------------------------------- */
/* SEO                                                                        */
/* -------------------------------------------------------------------------- */

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

<style scoped>
.portal-geometries-error {
  order: 70;
}
</style>
