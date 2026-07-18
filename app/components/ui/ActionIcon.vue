<template>
  <component
      :is="componentType"
      v-bind="componentProps"
      class="kbts-action-icon-wrapper"
      :class="{
      clickable: isClickable,
      selected
    }"
      :title="title"
      :aria-label="title"
      :role="isSpan ? 'button' : undefined"
      :tabindex="isSpan ? 0 : undefined"
      @click="handleClick"
      @keydown="handleKeydown"
  >
    <component
        v-if="icon"
        :is="icon"
        class="icon-svg"
        :size="resolvedIconSize"
    />

    <span
        v-if="label"
        class="action-label"
    >
      {{ label }}
    </span>

    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'


interface Props {
  title?: string

  to?: RouteLocationRaw | string

  onClick?: (event?: MouseEvent) => void

  icon?: Component

  iconSize?: number | string

  label?: string

  selected?: boolean
}


const props = withDefaults(
    defineProps<Props>(),
    {
      iconSize: 20,
      selected: false,
    }
)


const emit = defineEmits<{
  click: []
}>()


const isExternal = computed(() => {
  if (typeof props.to !== 'string') {
    return false
  }

  return /^(https?:\/\/|mailto:|tel:)/i.test(props.to)
})


const hasLink = computed(() =>
    Boolean(props.to)
)


const componentType = computed(() => {
  if (!hasLink.value) {
    return 'span'
  }

  return isExternal.value
      ? 'a'
      : resolveComponent('NuxtLink')
})


const componentProps = computed(() => {
  if (!props.to) {
    return {}
  }

  if (isExternal.value) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  }

  return {
    to: props.to,
  }
})


const isSpan = computed(() =>
    componentType.value === 'span'
)


const resolvedIconSize = computed(() =>
    props.iconSize ?? 20
)


const isClickable = computed(() =>
    Boolean(props.to || props.onClick)
)


function handleClick(event: MouseEvent) {
  if (!props.onClick) {
    return
  }

  props.onClick(event)

  emit('click')

  if (props.to && !isExternal.value) {
    event.preventDefault()
  }
}


function handleKeydown(event: KeyboardEvent) {
  if (!isSpan.value) {
    return
  }

  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()

  handleClick(event as unknown as MouseEvent)
}
</script>

<style scoped lang="scss">
.kbts-action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: auto;
  height: auto;
  border-color: transparent;
  transition: background 0.2s ease, color 0.2s ease;
  color: var(--kbts-fg);
  margin: 0.25rem 0;

  &.clickable {
    cursor: pointer;
    text-decoration: none;
    &:hover {
      color: var(--kbts-hover-fg);
    }
  }
  &.selected {
    color: var(--kbts-select-fg);
    &:hover {
      color: var(--kbts-hover-fg);
    }
  }

  .icon-svg {
    stroke: currentColor;
    pointer-events: none;
    flex-shrink: 0;
    stroke-width: 1.3;
  }

  .action-label {
    font-size: 0.9rem;
    white-space: nowrap;
  }
}
</style>