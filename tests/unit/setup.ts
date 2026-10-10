import { vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import * as vue from 'vue'
import { api, useNuxtApp } from './nuxt'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventSummaryStore } from '../../app/stores/eventSummaryStore'
import { useEventFilterEditingStore } from '../../app/stores/eventFilterEditingStore'
import { useEventQueryParams } from '../../app/composables/useEventQueryParams'

const states = new Map<string, vue.Ref>()
beforeEach(() => {
  setActivePinia(createPinia())
  states.clear()
  api.mockReset()
  for (const [name, value] of Object.entries(vue)) vi.stubGlobal(name, value)
  vi.stubGlobal('storeToRefs', storeToRefs)
  vi.stubGlobal('useNuxtApp', useNuxtApp)
  vi.stubGlobal('useFiltersStore', useFiltersStore)
  vi.stubGlobal('useEventSummaryStore', useEventSummaryStore)
  vi.stubGlobal('useEventFilterEditingStore', useEventFilterEditingStore)
  vi.stubGlobal('useEventQueryParams', useEventQueryParams)
  vi.stubGlobal('useState', (key: string, init: () => unknown) => {
    if (!states.has(key)) states.set(key, vue.ref(init()))
    return states.get(key)
  })
  vi.stubGlobal('useI18n', () => ({ t: (key: string) => key, locale: vue.ref('de') }))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
