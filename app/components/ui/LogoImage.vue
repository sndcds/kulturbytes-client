<template>

  <div
      class="logo-container"
      :style="containerStyle"
  >
    <component
        v-if="themeLogoSrc"
        :is="linkUrl ? 'a' : 'div'"
        v-bind="linkAttrs"
        class="logo-inner"
    >
      <img
          :src="optimizedImageUrl"
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
import { useThemeLogoSrc } from '@/composables/useThemeLogoSrc'
import { useOptimizedImageUrl } from '@/composables/useOptimizedImageUrl'
import { useImageSize } from '@/composables/useImageSize'


const DEFAULT_MAX_PIXELS = 320 * 40

interface Props {
  mainSrc?: string | null
  lightSrc?: string | null
  darkSrc?: string | null
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
  mainSrc: null,
  lightSrc: null,
  darkSrc: null,
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
  mainSrc,
  lightSrc,
  darkSrc,
  theme,
} = toRefs(props)

/**
 * Select correct logo according to theme
 */
const { themeLogoSrc } = useThemeLogoSrc({
  mainSrc,
  lightSrc,
  darkSrc,
  theme,
})

/**
 * Create optimized image URL
 */
const {
  optimizedImageUrl,
} = useOptimizedImageUrl(themeLogoSrc, {
  width: props.maxWidth,
  type: props.type,
  quality: props.quality,
})

/**
 * Calculate display size and loading state
 */
const {
  containerStyle,
  isLoaded,
  onLoad,
} = useImageSize(optimizedImageUrl, {
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
  pixelCount: props.pixelCount,
})

/**
 * Optional external link
 */
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

  opacity: 1;
  transition: opacity .2s ease;
}

.logo-image:not(.loaded) {
  opacity: 0;
}
</style>