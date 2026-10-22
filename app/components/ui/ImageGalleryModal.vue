<script setup lang="ts">
import { computed, ref } from 'vue'
import { X } from '@lucide/vue'
import type { Image } from '~/types/image'
import { aiLabelImages } from '~/utils/imageAiLabel'
import { useModalDialog } from '~/composables/useModalDialog'
import { useOptimizedImageUrl } from '~/composables/useOptimizedImageUrl'

const props = defineProps<{
  images: (Image & { credit?: string | null })[]
  initialIndex: number
  title: string
}>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const { close: closeDialog } = useModalDialog(dialog)
const activeIndex = ref(props.initialIndex)
const activeImage = computed(() => props.images[activeIndex.value])
const { optimizedImageUrl } = useOptimizedImageUrl(
  computed(() => activeImage.value?.url),
  { width: 1600 },
)

let swipeStart: { id: number, x: number, y: number } | undefined

function close() {
  closeDialog()
  emit('close')
}

function navigate(direction: number) {
  if (props.images.length < 2) return
  activeIndex.value = (activeIndex.value + direction + props.images.length) % props.images.length
}

function onPointerDown(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0) {
    swipeStart = undefined
    return
  }
  swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture?.(event.pointerId)
}

function onPointerUp(event: PointerEvent) {
  const start = swipeStart
  swipeStart = undefined
  if (!start || event.pointerId !== start.id) return
  const deltaX = event.clientX - start.x
  const deltaY = event.clientY - start.y
  if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    navigate(deltaX < 0 ? 1 : -1)
  }
}
</script>

<template>
  <dialog
      ref="dialog"
      class="image-gallery-modal"
      aria-labelledby="image-gallery-title"
      @cancel.prevent="close"
      @keydown.esc.prevent="close"
      @keydown.left.prevent="navigate(-1)"
      @keydown.right.prevent="navigate(1)"
      @click.self="close"
  >
    <div class="image-gallery-modal__panel">
      <header class="image-gallery-modal__header">
        <h2 id="image-gallery-title">{{ t('image_viewer.title') }}</h2>
        <button
            type="button"
            class="image-gallery-modal__close"
            :aria-label="t('image_viewer.close')"
            autofocus
            @click="close"
        >
          <X :size="24" aria-hidden="true" />
        </button>
      </header>

      <figure v-if="activeImage" class="image-gallery-modal__figure">
        <div
            class="image-gallery-modal__stage"
            :style="activeImage.width && activeImage.height ? { aspectRatio: `${activeImage.width} / ${activeImage.height}` } : undefined"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"
            @pointercancel="swipeStart = undefined"
        >
          <img
              :src="optimizedImageUrl || activeImage.url"
              :alt="activeImage.alt || title"
              class="image-gallery-modal__image"
              :draggable="false"
          >
          <img
              v-if="activeImage.ai_label && aiLabelImages[activeImage.ai_label]"
              :src="aiLabelImages[activeImage.ai_label]"
              alt=""
              class="kbts-image-ai-label"
          >
        </div>
        <figcaption v-if="activeImage.credit" class="image-gallery-modal__credit">
          {{ activeImage.credit }}
        </figcaption>
      </figure>

      <div
          v-if="images.length > 1"
          class="image-gallery-modal__navigation"
          role="group"
          :aria-label="t('image_viewer.navigation')"
      >
        <button
            v-for="(image, index) in images"
            :key="image.uuid"
            type="button"
            class="image-gallery-modal__dot"
            :class="{ 'is-active': index === activeIndex }"
            :aria-label="t('image_viewer.show', { index: index + 1, count: images.length })"
            :aria-pressed="index === activeIndex"
            @click="activeIndex = index"
        >
          <span />
        </button>
      </div>
      <span class="image-gallery-modal__position" role="status">
        {{ t('image_viewer.position', { index: activeIndex + 1, count: images.length }) }}
      </span>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.image-gallery-modal {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  height: 100vh;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::backdrop { background: rgb(0 0 0 / 80%); }
}

.image-gallery-modal__panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-sizing: border-box;
  width: min(100%, 64rem);
  max-height: 100%;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--kbts-bg);
}

.image-gallery-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 1rem;

  h2 { margin: 0; font-size: 1rem; font-weight: 600; }
}

.image-gallery-modal__close,
.image-gallery-modal__dot {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
}

.image-gallery-modal__figure {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  margin: 0;
}

.image-gallery-modal__stage {
  position: relative;
  display: grid;
  aspect-ratio: 3 / 2;
  max-height: min(62vh, 40rem);
  max-height: min(62dvh, 40rem);
  min-height: 0;
  touch-action: pan-y pinch-zoom;
  user-select: none;
}

.image-gallery-modal__image {
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
}

.image-gallery-modal__credit {
  flex-shrink: 0;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

.image-gallery-modal__navigation {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.image-gallery-modal__dot {
  span {
    width: 10px;
    height: 10px;
    box-sizing: border-box;
    border: 1px solid currentColor;
    border-radius: 50%;
  }

  &.is-active span { background: currentColor; }
}

.image-gallery-modal__position {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
