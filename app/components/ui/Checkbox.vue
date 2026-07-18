<script setup lang="ts">
import { Check } from '@lucide/vue'

const props = defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label
      class="checkbox"
      :class="{ disabled }"
  >
    <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
    />

    <span class="checkbox-box">
      <Check
          :size="14"
          :stroke-width="3"
      />
    </span>

    <span
        v-if="label"
        class="checkbox-label"
    >
      {{ label }}
    </span>
  </label>
</template>

<style scoped lang="scss">
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: .5rem;

  cursor: pointer;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
}

.checkbox-box {
  width: 18px;
  height: 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 2px solid var(--kbts-border);
  border-radius: 4px;

  background: white;
  color: white;

  transition:
      background .15s ease,
      border-color .15s ease;

  svg {
    opacity: 0;
    transform: scale(.5);

    transition:
        opacity .15s ease,
        transform .15s ease;
  }
}

.checkbox input:checked + .checkbox-box {
  background: var(--kbts-fg);
  border-color: var(--kbts-fg);
}

.checkbox input:checked + .checkbox-box svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox input:focus-visible + .checkbox-box {
  outline: 2px solid var(--kbts-accent, red);
  outline-offset: 2px;
}

.checkbox.disabled {
  opacity: .5;
  cursor: not-allowed;
}
</style>