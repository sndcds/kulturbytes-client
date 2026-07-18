<template>
  <span :style="iconStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '~/composables/useTheme'

const props = withDefaults(
    defineProps<{
      path: string
      color?: string
      size?: string | number
    }>(),
    {
      size: 24,
    }
)

const { isLight } = useTheme()

const iconStyle = computed(() => {
  const size =
      typeof props.size === 'number'
          ? `${props.size}px`
          : props.size
  return {
    width: size,
    aspectRatio: '1 / 1',
    display: 'inline-block',

    backgroundColor: isLight.value
        ? props.color ?? 'var(--kbts-fg)'
        : 'var(--kbts-fg)',

    WebkitMaskImage: `url(${props.path})`,
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain',

    maskImage: `url(${props.path})`,
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain',
  }
})
</script>