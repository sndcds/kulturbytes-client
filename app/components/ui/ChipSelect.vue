<script setup lang="ts">
interface ChipOption {
  id: string | number
  label: string
  color?: string
}

const { t } = useI18n()

const model = defineModel<string | number | null>({
  default: null,
})

const props = withDefaults(
    defineProps<{
      options: ChipOption[]
    }>(),
    {}
)

function selectChip(id: string | number) {
  model.value = model.value === id ? null : id
}

function isSelected(id: string | number) {
  return model.value === id
}
</script>


<template>
  <div class="kbts-chip-container">
    <button
        v-for="option in props.options"
        :key="option.id"
        type="button"
        class="kbts-chip"
        :class="{ selected: isSelected(option.id) }"
        @click="selectChip(option.id)"
    >
      <span>
        {{ t(option.label) }}
      </span>
    </button>
  </div>
</template>
