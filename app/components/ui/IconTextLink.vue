<template>
  <a
      :href="props.url"
      target="_blank"
      rel="noopener noreferrer"
      :class="props.class"
  >
    <SquareSVG
        :path="icon.path"
        :size="props.size"
        :color="icon.color"
    />

    <span :class="labelClass">
      {{ displayLabel }}
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SquareSVG from '@/components/ui/SquareSVG.vue'
import {
  LINK_ICONS,
  FALLBACK_ICON,
  type LinkType,
} from '~/constants/linkIcons'

const props = withDefaults(
    defineProps<{
      url: string
      type?: LinkType
      label?: string
      size?: string
      class?: string
    }>(),
    {
      size: '22px',
    }
)

const icon = computed(() => {
  if (!props.type) {
    return FALLBACK_ICON
  }

  return LINK_ICONS[props.type] ?? FALLBACK_ICON
})

const displayLabel = computed(() => props.label || props.url)
const labelClass = computed(() => {
  return props.class
      ? `${props.class}__label`
      : 'text-link-label'
})
</script>
