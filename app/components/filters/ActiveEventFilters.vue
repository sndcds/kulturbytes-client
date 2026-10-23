<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Undo2, X } from '@lucide/vue'
import { useActiveEventFilters } from '~/composables/useActiveEventFilters'
import { useEventTypeStore } from '~/stores/eventTypesStore'
import { useEventFilterEditingStore } from '~/stores/eventFilterEditingStore'

const { t } = useI18n()
const { chips } = useActiveEventFilters()
const eventTypes = useEventTypeStore()
const editing = useEventFilterEditingStore()
const emit = defineEmits<{ reset: [] }>()

onMounted(() => {
    watch(() => editing.appliedFilters.eventTypeIds, ids => {
        if (ids.length) void eventTypes.fetchTypes()
    }, { immediate: true })
})
</script>

<template>
    <section v-if="chips.length" class="active-event-filters" :aria-label="t('filter.active')">
        <span class="active-event-filters-label">{{ t('filter.active') }}</span>
        <ul class="active-event-filters-list">
            <li v-for="chip in chips" :key="chip.id">
                <button
                    type="button"
                    class="kbts-chip active-event-filter-chip"
                    :aria-label="t('filter.remove', { filter: chip.label })"
                    @click="chip.remove()"
                >
                    <span>{{ chip.label }}</span>
                    <X :size="16" aria-hidden="true" />
                </button>
            </li>
        </ul>
        <button type="button" class="kbts-button active-event-filters-reset" @click="emit('reset')">
            <Undo2 :size="16" aria-hidden="true" />
            <span>{{ t('filter.reset') }}</span>
        </button>
    </section>
</template>

<style scoped lang="scss">
.active-event-filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .75rem;
    margin-bottom: 1.5rem;
}

.active-event-filters-label {
    font-size: .9rem;
    font-weight: 600;
}

.active-event-filters-list {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    min-width: 0;
    max-width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
        min-width: 0;
        max-width: 100%;
    }
}

.active-event-filter-chip {
    gap: .5rem;
    min-height: 44px;
    max-width: 100%;
    background: var(--kbts-chip-emphasis-bg);
    font-family: inherit;
    text-align: left;

    span {
        overflow-wrap: anywhere;
    }

    svg {
        flex-shrink: 0;
    }
}

.active-event-filters-reset {
    display: inline-flex;
    align-items: center;
    align-self: center;
    gap: .5rem;
    min-height: 44px;
    font-size: .9rem;
}

button:focus-visible {
    outline: 2px solid var(--kbts-hover-fg);
    outline-offset: 3px;
}
</style>
