<script setup lang="ts">
interface Category {
  id: number
  label: string
  color: string
}

const { t } = useI18n()

const selected = defineModel<number[] | null>({
  default: null,
})

const props = withDefaults(
    defineProps<{
      multiple?: boolean
    }>(),
    {
      multiple: true,
    }
)

const categories: Category[] = [
  {
    id: 1,
    label: "event.category.culture",
    color: "var(--event-category-culture-color)",
  },
  {
    id: 2,
    label: "event.category.education",
    color: "var(--event-category-education-color)",
  },
  {
    id: 3,
    label: "event.category.sports",
    color: "var(--event-category-sports-color)",
  },
  {
    id: 4,
    label: "event.category.leisure",
    color: "var(--event-category-leisure-color)",
  },
  {
    id: 5,
    label: "event.category.family",
    color: "var(--event-category-family-color)",
  },
  {
    id: 6,
    label: "event.category.society",
    color: "var(--event-category-society-color)",
  },
]

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
  <div class="category-selector">
    <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="category-chip"
        :class="{ selected: isSelected(cat.id) }"
        :style="{ '--chip-color': cat.color }"
        @click="toggleCategory(cat.id)"
    >
      <span class="indicator" />

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
  padding: .5rem 0;
}

.category-chip {
  --chip-color: #888;

  display: inline-flex;
  align-items: center;
  gap: .45rem;

  padding: .35rem .75rem;

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