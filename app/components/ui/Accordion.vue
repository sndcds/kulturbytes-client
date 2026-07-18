<template>
  <div class="kbts-accordion">
    <button
        class="kbts-accordion__header"
        type="button"
        :aria-expanded="open"
        @click="open = !open"
    >
      <span class="kbts-accordion__title">
        <slot name="icon" />
        <slot name="title" />
      </span>

      <ChevronRight
          class="kbts-accordion__chevron"
          :class="{ 'is-open': open }"
          :size="18"
      />
    </button>

    <Transition name="accordion">
      <div
          v-if="open"
          class="kbts-accordion__content"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight } from '@lucide/vue'

const props = defineProps<{
  defaultOpen?: boolean
}>()

const open = ref(props.defaultOpen ?? false)
</script>

<style scoped lang="scss">
.kbts-accordion {
  width: 100%;
}

.kbts-accordion__header {
  width: 100%;
  display: flex;
  align-items: center;
  // justify-content: space-between;

  padding: 0.5rem 0;
  border: 0;
  background: none;

  cursor: pointer;
  color: inherit;
  font: inherit;
  text-align: left;
}

.kbts-accordion__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1rem;
}

.kbts-accordion__chevron {
  transition: transform .2s ease;
}

.kbts-accordion__chevron.is-open {
  transform: rotate(90deg);
}

.kbts-accordion__content {
  overflow: hidden;
}

/* animation */
.accordion-enter-active,
.accordion-leave-active {
  transition:
      opacity .25s ease,
      max-height .25s ease;
  max-height: 500px;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>