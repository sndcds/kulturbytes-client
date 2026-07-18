<template>
  <div
      v-if="src"
      class="logo-container"
      :style="containerStyle"
  >
    <component
        :is="linkUrl ? 'a' : 'div'"
        v-bind="linkAttrs"
        class="logo-inner"
    >
      <img
          :src="src"
          :alt="alt"
          class="logo-image"
          :class="{ loaded: isLoaded }"
          loading="lazy"
          @load="onLoad"
      >
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

import { useLogoUrl } from '@/composables/useLogoUrl'
import { useImageUrl } from '@/composables/useImageUrl'
import { useImageSize } from '@/composables/useImageSize'

const DEFAULT_MAX_PIXELS = 320 * 40

interface Props {
  logoUrl?: string | null
  lightThemeLogoUrl?: string | null
  darkThemeLogoUrl?: string | null

  theme: string

  alt?: string

  maxWidth?: number
  maxHeight?: number
  pixelCount?: number

  type?: string
  quality?: number

  linkUrl?: string | null
  linkTarget?: string
  rel?: string
}

const props = withDefaults(defineProps<Props>(), {
  logoUrl: null,
  lightThemeLogoUrl: null,
  darkThemeLogoUrl: null,

  alt: 'Logo',

  maxWidth: 240,
  maxHeight: 100,
  pixelCount: DEFAULT_MAX_PIXELS,

  type: 'png',
  quality: 80,

  linkUrl: null,
  linkTarget: '_self',
  rel: 'noopener noreferrer',
})

const {
  logoUrl,
  lightThemeLogoUrl,
  darkThemeLogoUrl,
  theme,
} = toRefs(props)


// Select correct logo for theme
const {
  logoUrl: selectedLogo,
} = useLogoUrl({
  logoURL: logoUrl,
  lightThemeLogoURL: lightThemeLogoUrl,
  darkThemeLogoURL: darkThemeLogoUrl,
  theme,
})


// Create optimized image URL
const {
  imageUrl: src,
} = useImageUrl(selectedLogo, {
  width: props.maxWidth,
  type: props.type,
  quality: props.quality,
})


// Calculate rendered size + loading state
const {
  containerStyle,
  isLoaded,
  onLoad,
} = useImageSize(src, {
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
  pixelCount: props.pixelCount,
})


const linkAttrs = computed(() =>
    props.linkUrl
        ? {
          href: props.linkUrl,
          target: props.linkTarget,
          rel: props.rel,
        }
        : {},
)
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-image {
  display: block;

  max-width: 100%;
  max-height: 100%;

  width: auto;
  height: auto;

  object-fit: contain;
  object-position: center;

  opacity: 0;
  transition: opacity .2s ease;
}

.logo-image.loaded {
  opacity: 1;
}
</style>