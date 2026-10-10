<script setup lang="ts">
import CategorySelector from '~/components/event/ui/CategorySelector.vue'
import ChipSelect from '~/components/ui/ChipSelect.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import Checkbox from '~/components/ui/Checkbox.vue'
import TypeGenreSelect from '~/components/event/ui/TypeGenreSelect.vue'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useEventSummaryStore } from '~/stores/eventSummaryStore'

const { t } = useI18n()
const eventFilters = useFiltersStore()

const {
  eventFilterTab,
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

const filterTabs = [
  { id: 'location', label: 'event.filter.location' },
  { id: 'types', label: 'event.filter.types' },
  { id: 'age', label: 'event.filter.age' },
  { id: 'price', label: 'event.filter.price' }
] as const

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


const emit = defineEmits<{ close: [], show: [] }>()
const summaryStore = useEventSummaryStore()
const { totalEventCount, loading, error } = storeToRefs(summaryStore)
const dialog = ref<HTMLDialogElement | null>(null)
let releaseDialog: (() => void) | undefined

onMounted(() => {
  const body = document.body
  const root = document.documentElement
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const previousStyles = {
    position: body.style.position, top: body.style.top,
    left: body.style.left, width: body.style.width, overflow: body.style.overflow,
  }
  const rootOverflow = root.style.overflow
  const rootScrollbarGutter = root.style.scrollbarGutter
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  Object.assign(body.style, { position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, width: '100%', overflow: 'hidden' })
  root.style.overflow = 'hidden'
  // The global stable scrollbar gutter would otherwise leave a 15px gap beside the dialog.
  root.style.scrollbarGutter = 'auto'
  dialog.value?.showModal()
  releaseDialog = () => {
    dialog.value?.close()
    Object.assign(body.style, previousStyles)
    root.style.overflow = rootOverflow
    root.style.scrollbarGutter = rootScrollbarGutter
    window.scrollTo(scrollX, scrollY)
    previousFocus?.focus({ preventScroll: true })
    releaseDialog = undefined
  }
  void summaryStore.loadSummary()
})

onBeforeUnmount(() => releaseDialog?.())

function finish(showResults = false) {
  releaseDialog?.()
  if (showResults) emit('show')
  else emit('close')
}

function onTabKeydown(event: KeyboardEvent) {
  const index = filterTabs.findIndex(tab => tab.id === eventFilterTab.value)
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % filterTabs.length
  else if (event.key === 'ArrowLeft') next = (index + filterTabs.length - 1) % filterTabs.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = filterTabs.length - 1
  else return
  event.preventDefault()
  const tab = filterTabs[next]
  if (!tab) return
  eventFilterTab.value = tab.id
  document.getElementById(`event-filter-tab-${tab.id}`)?.focus()
}
</script>


<template>

  <dialog ref="dialog" class="mobile-event-filters" aria-labelledby="mobile-filter-title" @cancel.prevent="finish()" @keydown.esc.prevent="finish()">
    <header class="mobile-filter-header">
      <h2 id="mobile-filter-title">{{ t('filter.settings') }}</h2>
    </header>
    <div class="filters mobile-filter-content">
    <CategorySelector
        v-model="eventCategories"
        compact
    />

    <input
        class="search-text"
        v-model="eventSearchInput"
        :placeholder="t('event.search_placeholder')"
        :aria-label="t('event.search_placeholder')"
        type="search"
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

    <div class="filter-tabs">
      <div
          class="filter-tab-list"
          role="tablist"
          :aria-label="t('filter.settings')"
          @keydown="onTabKeydown"
      >
        <button
            v-for="tab in filterTabs"
            :id="`event-filter-tab-${tab.id}`"
            :key="tab.id"
            type="button"
            class="filter-tab"
            role="tab"
            :aria-selected="eventFilterTab === tab.id"
            :tabindex="eventFilterTab === tab.id ? 0 : -1"
            :aria-controls="`event-filter-panel-${tab.id}`"
            :class="{ active: eventFilterTab === tab.id }"
            @click="eventFilterTab = tab.id"
        >
          {{ t(tab.label) }}
        </button>
      </div>

      <div
          v-show="eventFilterTab === 'location'"
          id="event-filter-panel-location"
          class="filter-tab-panel"
          role="tabpanel"
          aria-labelledby="event-filter-tab-location"
      >
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
            <label for="venue-name">
              {{ t('event.filter.venue_name') }}
            </label>
            <input
                id="venue-name"
                v-model="eventVenueInput"
            />
          </div>

          <div class="input-field">
            <label for="radius">
              {{ t('event.filter.location_radius') }}
            </label>
            <div class="location-radius-field">
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
      </div>

      <div
          v-show="eventFilterTab === 'types'"
          id="event-filter-panel-types"
          class="filter-tab-panel"
          role="tabpanel"
          aria-labelledby="event-filter-tab-types"
      >
        <TypeGenreSelect
            @change="eventFilters.setEventTypes"
        />
      </div>

      <div
          v-show="eventFilterTab === 'age'"
          id="event-filter-panel-age"
          class="filter-tab-panel"
          role="tabpanel"
          aria-labelledby="event-filter-tab-age"
      >
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
      </div>

      <div
          v-show="eventFilterTab === 'price'"
          id="event-filter-panel-price"
          class="filter-tab-panel"
          role="tabpanel"
          aria-labelledby="event-filter-tab-price"
      >
        <div class="price-filter-panel">
          <div class="input-fields-container">
              <ChipSelect
                  v-model="eventPriceType"
                  :options="priceTypeOptions"
              />
          </div>
          <div v-if="eventPriceType === 'max_price'" class="input-fields-container">
            <div class="input-field">
              <label for="max-price">
                {{ t('event.filter.max_price') }}
              </label>
              <input
                  id="max-price"
                  v-model.number="eventMaxPrice"
                  type="number"
                  min="0"
                  step="1"
              />
            </div>

            <div class="input-field">
              <label for="price-currency">
                {{ t('filter.currency') }}
              </label>
              <input id="price-currency" v-model="eventPriceCurrency" maxlength="3" />
            </div>
          </div>
        </div>
      </div>
    </div>

    </div>
    <footer class="mobile-filter-footer">
      <div class="mobile-filter-actions">
        <button type="button" class="text-action" @click="eventFilters.resetFilters()">
          {{ t('event.filter.reset_filters') }}
        </button>
        <button type="button" class="text-action" @click="finish()">
          {{ t('filter.close') }}
        </button>
      </div>
      <div class="mobile-filter-results">
        <span class="result-count" role="status" aria-live="polite" :aria-busy="loading" :class="{ loading }">
          <template v-if="loading">{{ t('filter.results_loading') }}</template>
          <template v-else-if="error">{{ t('filter.results_error') }}</template>
          <template v-else-if="totalEventCount !== null">{{ t('filter.results', { count: totalEventCount }) }}</template>
          <template v-else>{{ t('filter.results_loading') }}</template>
        </span>
        <button type="button" class="kbts-button show-results-button" @click="finish(true)">
          {{ t('filter.show_results') }}
        </button>
      </div>
    </footer>
  </dialog>

</template>


<style scoped lang="scss">
.mobile-event-filters {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  height: 100vh;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--kbts-bg);
  color: var(--kbts-fg);
  overflow: hidden;
  font: inherit;

  &[open] { display: flex; flex-direction: column; }
  &::backdrop { background: var(--kbts-bg); }
}

.mobile-filter-header {
  flex-shrink: 0;
  padding: calc(.8rem + env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) .8rem max(1rem, env(safe-area-inset-left));
  border-bottom: 1px solid var(--kbts-border);
  h2 { margin: 0; font-size: 1rem; font-weight: 600; }
}

.mobile-filter-content {
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 1rem max(1rem, env(safe-area-inset-right)) 1rem max(1rem, env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-filter-footer {
  flex-shrink: 0;
  padding: .4rem max(1rem, env(safe-area-inset-right)) calc(.75rem + env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  border-top: 1px solid var(--kbts-border);
  background: var(--kbts-bg);
}

.mobile-filter-actions, .mobile-filter-results {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}

.text-action {
  min-height: 44px;
  border: 0;
  padding: .4rem 0;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;
  font-size: .86rem;
  cursor: pointer;
}

.show-results-button {
  flex-shrink: 0;
  min-height: 44px;
  align-self: auto;
  padding: .6rem 1.4rem;
  background: var(--kbts-fg);
  color: var(--kbts-bg);
}

.result-count { font-size: .9rem; }
.result-count.loading { color: var(--kbts-muted-fg); }
button:focus-visible { outline: 2px solid var(--kbts-chip-bg-active); outline-offset: 2px; }

input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: .5rem .85rem;
  border: 0;
  border-radius: 999px;
  background: var(--kbts-card-bg);
  color: var(--kbts-fg);
  font: inherit;
  font-size: 1rem;
  &::placeholder { color: var(--kbts-muted-fg); opacity: 1; }
}

.input-fields-container { display: flex; gap: .8rem; flex-wrap: wrap; }
.input-field { display: flex; flex-direction: column; gap: .4rem; min-width: 0; flex: 1 1 130px; }
label { font-size: .86rem; margin-left: .5rem; }
.filter-tabs { display: flex; flex-direction: column; gap: .75rem; min-width: 0; }
.filter-tab-list { display: flex; gap: .15rem; overflow-x: auto; padding: .25rem; }
.filter-tab {
  flex: 0 0 auto;
  min-height: 44px;
  padding: .35rem .65rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--kbts-fg);
  font: inherit;
  font-size: .9rem;
  white-space: nowrap;
  cursor: pointer;
  &.active { background: var(--kbts-fg); color: var(--kbts-bg); }
}
.location-radius-field { display: flex; align-items: center; gap: .75rem; width: 100%; }
.price-filter-panel { display: flex; flex-direction: column; gap: .8rem; }
:deep(.kbts-chip) { max-width: 100%; overflow-wrap: anywhere; text-align: left; }
</style>
