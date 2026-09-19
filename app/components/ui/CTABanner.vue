<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'

interface CtaLink {
  label: string
  to: string | Record<string, unknown>
  external?: boolean
}

type ImageAlign = 'left' | 'center' | 'right'
type ImageVerticalAlign = 'top' | 'center' | 'bottom'

const props = withDefaults(
    defineProps<{
      title: string
      links: CtaLink[]

      // Foreground image
      imageUrl?: string
      imageWidth?: number
      imageMaxWidth?: number | string
      imageAlign?: ImageAlign
      imageVerticalAlign?: ImageVerticalAlign

      // Background images
      backgroundImage?: string
      mobileBackgroundImage?: string

      titleColor?: string
      textColor?: string
      backgroundColor?: string
      ctaColor?: string
    }>(),
    {
      imageWidth: 100,
      imageAlign: 'center',
      imageVerticalAlign: 'center',

      backgroundImage: undefined,
      mobileBackgroundImage: undefined,

      titleColor: 'inherit',
      textColor: 'inherit',
      backgroundColor: 'transparent',
      ctaColor: 'inherit'
    }
)

const imageContainerStyle = computed(() => ({
  justifyContent: {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  }[props.imageAlign],

  alignItems: {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  }[props.imageVerticalAlign]
}))

const imageStyle = computed(() => ({
  width: `${props.imageWidth}%`,
  maxWidth:
      typeof props.imageMaxWidth === 'number'
          ? `${props.imageMaxWidth}px`
          : props.imageMaxWidth
}))

const style = computed(() => ({
  '--cta-banner-title-color': props.titleColor,
  '--cta-banner-text-color': props.textColor,
  '--cta-banner-background-color': props.backgroundColor,
  '--cta-banner-cta-color': props.ctaColor,
  '--cta-banner-background-image': props.backgroundImage
      ? `url("${props.backgroundImage}")`
      : 'none',
  '--cta-banner-mobile-background-image': props.mobileBackgroundImage
      ? `url("${props.mobileBackgroundImage}")`
      : props.backgroundImage
          ? `url("${props.backgroundImage}")`
          : 'none'
}))
</script>

<template>
  <section
      class="cta-banner"
      :style="style"
  >
    <div
        v-if="imageUrl"
        class="cta-banner__image-container"
        :style="imageContainerStyle"
    >
      <img
          :src="imageUrl"
          alt=""
          class="cta-banner__image"
          :style="imageStyle"
      >
    </div>

    <div class="cta-banner__content">
      <div class="cta-banner__text">
        <h1>{{ title }}</h1>

        <div class="cta-banner__description">
          <slot name="description" />
        </div>
      </div>

      <nav class="cta-banner__actions">
        <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="cta-banner__action"
        >
          <span class="cta-banner__action-label">
            {{ link.label }}
          </span>

          <ArrowRight
              class="cta-banner__arrow"
              :size="32"
              :stroke-width="1.5"
              aria-hidden="true"
          />
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta-banner {
  display: grid;
  grid-template-columns: 50% 50%;

  margin-bottom: 3rem;

  overflow: hidden;

  background-color: var(--cta-banner-background-color);
  background-image: var(--cta-banner-background-image);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  border-radius: var(--kbts-border-radius);

  &__image-container {
    display: flex;
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    min-height: 0;
    padding: 2rem;
  }

  &__image {
    display: block;
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-column: 2;
    grid-row: 1;
    padding: 2.5rem 3rem 1.5rem;
  }

  &__text {
    max-width: 42rem;

    h1 {
      margin: 0 0 1.25rem;
      color: var(--cta-banner-title-color);
    }
  }

  &__description {
    max-width: 38rem;
    color: var(--cta-banner-text-color);
    line-height: 1.6;

    :deep(a) {
      color: inherit;
      text-decoration: none;
      text-underline-offset: 0.15em;

      &:hover {
        text-decoration-thickness: 2px;
      }
    }
  }

  &__actions {
    width: 100%;
    margin-top: 1rem;
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 1rem;
    padding: 0.5rem 0;
    color: var(--cta-banner-cta-color);
    text-decoration: none;
    border-top: 1px dotted currentColor;

    &:last-child {
      border-bottom: 1px dotted currentColor;
    }

    &:hover {
      .cta-banner__arrow {
        transform: translateX(0.5rem);
      }
    }

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 4px;
    }
  }

  &__action-label {
    flex: 1;
  }

  &__arrow {
    flex-shrink: 0;
    transition: transform 180ms ease;
  }
}

@media (max-width: 700px) {
  .cta-banner {
    grid-template-columns: 1fr;
    background-image: var(--cta-banner-mobile-background-image);

    &__image-container {
      display: none;
    }

    &__content {
      grid-column: 1;
      grid-row: 1;
      padding: 1.75rem 1.5rem 1.5rem;
    }

    &__text {
      h1 {
        margin-bottom: 1rem;
      }
    }

    &__description {
      line-height: 1.55;
    }

    &__actions {
      margin-top: 2rem;
    }

    &__action {
      font-size: 1.3rem;
      min-height: 4rem;
      padding: 0.75rem 0;
      gap: 1rem;
    }

    &__action-label {
      line-height: 1.35;
    }

    &__arrow {
      width: 28px;
      height: 28px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .cta-banner__arrow {
    transition: none;
  }
}
</style>