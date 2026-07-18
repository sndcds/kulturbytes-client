<template>
  <div
      class="kbts-event-price-badge"
      :style="badgeStyle"
  >
    <Heart
        v-if="priceType === 'free'"
        :size="size"
        style="stroke-width: 1.5"
    />

    <HandCoins
        v-else-if="priceType === 'donation'"
        :size="size"
        style="stroke-width: 1.5"
    />
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { Heart, HandCoins } from '@lucide/vue'

const props = withDefaults(
    defineProps<{
      priceType?: string
      size?: number
    }>(),
    {
      priceType: 'free',
      size: 20,
    }
)

const badgeStyle = computed(() => ({
  padding: `${props.size * 0.3}px`,
}))
</script>

<style scoped lang="scss">
.event-price-badge {
  position: absolute;
  color: var(--kbts-fg);
  background: var(--kbts-bg);
  border-radius: 50%;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
</style>