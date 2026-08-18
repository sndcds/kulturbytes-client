<script setup lang="ts">
withDefaults(
    defineProps<{
      size?: number
      ariaLabel?: string
    }>(),
    {
      size: 48,
      ariaLabel: 'kulturbytes'
    }
)
</script>

<template>
  <div
      class="kulturbytes-icon"
      :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
      :aria-label="ariaLabel"
      role="button"
      tabindex="0"
  >
    <span class="kulturbytes-icon__logo" />
  </div>
</template>

<style scoped>
.kulturbytes-icon {
  border: 0 solid var(--color-border, #ccc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--color-text, #000);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.kulturbytes-icon__logo {
  width: 70%;
  height: 70%;
  background-color: currentColor;

  mask-image: url("/icons/kulturbytes.svg");
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;

  -webkit-mask-image: url("/icons/kulturbytes.svg");
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;

  transform: translateX(-7%);
}

.kulturbytes-icon:hover {
  color: #f20d5e;
}
</style>