<script setup lang="ts">
import { eventCategories as categories } from '~/utils/eventCategories'

const { t } = useI18n()

const selected = defineModel<number[] | null>({
  default: null,
})

const props = withDefaults(
    defineProps<{
      multiple?: boolean
      compact?: boolean
    }>(),
    {
      multiple: true,
    }
)

function isSelected(id: number) {
  return selected.value?.includes(id) ?? false
}

function toggleCategory(id: number) {
  const current = selected.value ?? []

  let next: number[]

  if (props.multiple) {
    next = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]
  } else {
    next = current.includes(id)
        ? []
        : [id]
  }

  selected.value = next.length ? next : null
}
</script>


<template>
  <div class="category-selector" :class="{ compact: props.compact }">
    <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="category-chip"
        :class="{ selected: isSelected(cat.id) }"
        :aria-pressed="isSelected(cat.id)"
        :style="{ '--chip-color': cat.color }"
        @click="toggleCategory(cat.id)"
    >
      <span v-if="!props.compact" class="indicator" />

      <span>
        {{ t(cat.label) }}
      </span>
    </button>
  </div>
</template>


<style scoped lang="scss">
.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding: .1rem 3rem .1rem 0;
}

.category-selector.compact {
  padding-right: 0;
  gap: .35rem;

  .category-chip {
    padding: .35rem .65rem;
    border-color: color-mix(in srgb, var(--chip-color) 40%, transparent);
  }
}

.category-chip {
  --chip-color: #888;

  display: inline-flex;
  align-items: center;
  gap: .45rem;

  padding: .4rem .7rem;

  border: 1px solid color-mix(in srgb, var(--chip-color) 0%, transparent);
  border-radius: 999px;
  background: var(--kbts-bg);
  color: var(--kbts-fg);

  font-size: .9rem;
  font-weight: 500;

  cursor: pointer;

  transition:
      background .2s ease,
      border-color .2s ease,
      transform .15s ease;


  &:hover {
    border-color: var(--chip-color);
  }


  &.selected {
    background: var(--chip-color);
    border-color: var(--chip-color);
    color: white;
  }
}


.indicator {
  width: .45rem;
  height: .45rem;

  border-radius: 50%;

  background: var(--chip-color);

  transition:
      transform .2s ease,
      background .2s ease;
}


.selected .indicator {
  background: white;
  transform: scale(1.2);
}
</style>
