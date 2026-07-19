<script setup lang="ts">
import Collapsible from '~/components/ui/Collapsible.vue'
import CategorySelector from '~/components/event/ui/CategorySelector.vue'
import ChipSelect from '~/components/ui/ChipSelect.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import Checkbox from '~/components/ui/Checkbox.vue'
import TypeGenreSelect from '~/components/event/ui/TypeGenreSelect.vue'

const { t } = useI18n()
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
  eventLocationRadius,
  eventAgeFrom,
  eventAgeTo,
  eventPriceType,
  eventPriceCurrency,
  eventMaxPrice
} = storeToRefs(eventFilters)

const dateSpanOptions = [
  { id: "all", label: 'event.date_span.all' },
  { id: "today", label: 'event.date_span.today' },
  { id: "tomorrow", label: 'event.date_span.tomorrow' },
  { id: "weekend", label: 'event.date_span.weekend' },
  { id: "next_week", label: 'event.date_span.next_week' },
  { id: "weekend_after", label: 'event.date_span.weekend_after' },
  { id: "range", label: 'event.date_span.range' },
]

const priceTypeOptions = [
  { id: 'free', label: 'event.price_free' },
  { id: 'donation', label: 'event.price_donation' },
  { id: 'max_price', label: 'event.price_max' }
]

const eventSearchInput = computed({
  get: () => eventSearch.value,
  set(value: string) {
    eventSearch.value = value.replace(/^\s+/, '')
  }
})

const eventCityInput = computed({
  get: () => eventCity.value,
  set(value: string) {
    eventCity.value = value.replace(/^\s+/, '')
  }
})

const eventPostalCodeInput = computed({
  get: () => eventPostalCode.value,
  set(value: string) {
    eventPostalCode.value = value.replace(/^\s+/, '')
  }
})

const eventVenueInput = computed({
  get: () => eventVenue.value,
  set(value: string) {
    eventVenue.value = value.replace(/^\s+/, '')
  }
})
</script>


<template>

  <div class="filters">
    <CategorySelector
        v-model="eventCategories"
    />

    <input
        v-model="eventSearchInput"
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
            {{ t('event.filter.date_from') }}
          </label>

          <input
              type="date"
              id="start-date"
              v-model="eventDateStart"
          />
        </div>

        <div class="input-field">
          <label for="end-date">
            {{ t('event.filter.date_to') }}
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
        {{ t('event.filter.location') }}
      </template>

      <div class="input-fields-container">
        <div class="input-field">
          <label for="city">
            {{ t('event.filter.city') }}
          </label>
          <input
              id="city"
              v-model="eventCityInput"
          />
        </div>

        <div class="input-field">
          <label for="postal-code">
            {{ t('event.filter.postal_code') }}
          </label>
          <input
              id="postal-code"
              v-model="eventPostalCodeInput"
          />
        </div>

        <div class="input-field">
          <label for="city">
            {{ t('event.filter.venue_name') }}
          </label>
          <input
              id="city"
              v-model="eventVenueInput"
          />
        </div>

        <div class="input-field">
          <label for="location">
            {{ t('event.filter.location_radius') }}
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
        {{ t('event.filter.types') }}
      </template>
      <TypeGenreSelect
          @change="eventFilters.setEventTypes"
      />
    </Collapsible>

    <Collapsible>
      <template #title>
          {{ t('event.filter.age') }}
      </template>
      <div class="input-fields-container">
        <div class="input-field">
          <label for="age_from">
            {{ t('event.filter.age_from') }}
          </label>
          <input
              id="age_from"
              v-model.number="eventAgeFrom"
              type="number"
              min="0"
              max="999"
              step="1"
          />
        </div>
        <div class="input-field">
          <label for="age_to">
            {{ t('event.filter.age_to') }}
          </label>
          <input
              id="age_to"
              v-model.number="eventAgeTo"
              type="number"
              min="0"
              max="999"
              step="1"
          />
        </div>
      </div>

    </Collapsible>

    <Collapsible>
      <template #title>
        {{ t('event.filter.price') }}
      </template>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="input-fields-container">
            <ChipSelect
                v-model="eventPriceType"
                :options="priceTypeOptions"
            />
        </div>
        <div v-if="eventPriceType === 'max_price'" class="input-fields-container">
          <div class="input-field">
            <label>
              {{ t('event.filter.max_price') }}
            </label>
            <input
                v-model.number="eventMaxPrice"
                type="number"
                min="0"
                step="1"
            />
          </div>

          <div class="input-field">
            <label>
              {{ t('event.filter.currency') }}
            </label>
            <!--select v-model="eventPriceCurrency">
              <option
                  v-for="currency in priceCurrencyOptions"
                  :key="currency.id"
                  :value="currency.id"
              >
                {{ currency.label }}
              </option>
            </select-->
          </div>
        </div>
      </div>
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
}

.radio-option {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;

  padding: .45rem .9rem;
  border-radius: 999px;

  background: var(--kbts-card-bg);
  color: var(--kbts-fg);
  border: 1px solid var(--kbts-input-border);

  transition:
      background .15s ease,
      color .15s ease,
      border-color .15s ease;

  user-select: none;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-option:has(input:checked) {
  background: var(--kbts-fg);
  color: var(--kbts-bg);
  border-color: var(--kbts-fg);
}
</style>

