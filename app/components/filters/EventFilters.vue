<script setup lang="ts">
import Collapsible from '~/components/ui/Collapsible.vue'
import CategorySelector from '~/components/event/ui/CategorySelector.vue'
import ChipSelect from '~/components/ui/ChipSelect.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import Checkbox from '~/components/ui/Checkbox.vue'
import TypeGenreSelect from "~/components/event/ui/TypeGenreSelect.vue";

const open = ref(false)
const eventFilters = useFiltersStore()

const {
  eventCategories,
  eventDateSpan,
  eventSearch,
  eventDateStart,
  eventDateEnd,
  eventCity,
  eventPostalCode,
  eventVenue,
  eventLocationFlag,
  eventLocationRadius
} = storeToRefs(eventFilters)

const dateSpanOptions = [
  { id: "all", label: "event.date_span.all" },
  { id: "today", label: "event.date_span.today" },
  { id: "tomorrow", label: "event.date_span.tomorrow" },
  { id: "weekend", label: "event.date_span.weekend" },
  { id: "next_week", label: "event.date_span.next_week" },
  { id: "weekend_after", label: "event.date_span.weekend_after" },
  { id: "range", label: "event.date_span.range" },
]

const { t } = useI18n()
</script>


<template>
  <div class="filters">
    <CategorySelector
        v-model="eventCategories"
    />

    <input
        v-model="eventSearch"
        :placeholder="t('event.search_placeholder')"
    />

    <ChipSelect
        v-model="eventDateSpan"
        :options="dateSpanOptions"
    />

    <template v-if="eventDateSpan === 'range'">
      <div class="input-fields-container">
        <div class="input-field">
          <label for="start-date">
            Von
          </label>

          <input
              type="date"
              id="start-date"
              v-model="eventDateStart"
          />
        </div>


        <div class="input-field">
          <label for="end-date">
            Bis
          </label>

          <input
              type="date"
              id="end-date"
              v-model="eventDateEnd"
          />
        </div>

      </div>
    </template>

    <Collapsible v-model="open">
      <template #title>
        <span class="kbts-collapsible-title">Ort</span>
      </template>

      <div class="input-fields-container">
        <div class="input-field">
          <label for="city">
            Ort/Stadt
          </label>
          <input
              id="city"
              v-model="eventCity"
          />
        </div>

        <div class="input-field">
          <label for="postal-code">
            PLZ
          </label>
          <input
              id="postal-code"
              v-model="eventPostalCode"
          />
        </div>

        <div class="input-field">
          <label for="city">
            Veranstaltungsort (Name)
          </label>
          <input
              id="city"
              v-model="eventVenue"
          />
        </div>

        <div class="input-field">
          <label for="location">
            Standort, Radius in km
          </label>
          <div style="display: flex; gap: 1rem;">
            <Checkbox
                v-model="eventLocationFlag"
            />
            <input
                id="radius"
                v-model.number="eventLocationRadius"
                type="number"
                min="0.5"
                max="999"
                step="0.5"
                placeholder="Radius in km"
            />

          </div>
        </div>
      </div>
    </Collapsible>

    <Collapsible>
      <template #title>
        <span class="kbts-collapsible-title">
          Veranstaltungstyp
        </span>
      </template>
      <TypeGenreSelect
          @change="eventFilters.setEventTypes"
      />
    </Collapsible>
  </div>

</template>


<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: white;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 1rem;
  border: 0 solid var(--kbts-input-border);
  border-radius: 999px;
  background: var(--kbts-card-bg);
  color: var(--kbts-fg);
  font-size: 1rem;
  font-weight: 400;
  &::placeholder {
    color: var(--kbts-muted-fg);
    opacity: 1;
  }
}

.input-fields-container {
  display: inline-flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-field {
  display: inline-flex;
  flex-direction: column;
  gap: .5rem;
  width: fit-content;
  align-items: flex-start;
}

label {
  font-size: 0.86rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
</style>

