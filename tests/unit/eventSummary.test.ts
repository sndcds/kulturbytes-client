import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useFiltersStore } from '../../app/stores/filtersStore'
import { useEventSummaryStore } from '../../app/stores/eventSummaryStore'
import { useEventFilterEditingStore } from '../../app/stores/eventFilterEditingStore'
import { useEventQueryParams } from '../../app/composables/useEventQueryParams'
import { api } from './nuxt'

const summary = (count: number) => ({ data: {
  total_event_count: count, type_summary: [{ id: 1, count }], genre_summary: [],
} })

describe('summary lifecycle', () => {
  afterEach(() => useEventSummaryStore().$dispose())

  it('debounces text, invalidates the old count immediately and displays zero', async () => {
    vi.useFakeTimers()
    api.mockResolvedValue(summary(10))
    const store = useEventSummaryStore()
    await vi.advanceTimersByTimeAsync(0)
    expect(store.totalEventCount).toBe(10)
    const filters = useFiltersStore()
    filters.eventSearch = 'm'
    expect(store.totalEventCount).toBeNull()
    expect(store.loading).toBe(true)
    filters.eventSearch = 'mu'
    filters.eventSearch = 'music'
    await vi.advanceTimersByTimeAsync(299)
    expect(api).toHaveBeenCalledTimes(1)
    api.mockResolvedValue(summary(0))
    await vi.advanceTimersByTimeAsync(1)
    expect(api).toHaveBeenCalledTimes(2)
    expect(store.totalEventCount).toBe(0)
    expect(store.loading).toBe(false)
    await store.loadSummary()
    expect(api).toHaveBeenCalledTimes(2)
  })

  it('deduplicates mounts and batches reset into a single summary request', async () => {
    vi.useFakeTimers()
    api.mockResolvedValue(summary(10))
    const filters = useFiltersStore()
    filters.eventSearch = 'text'
    filters.eventCategories = [1]
    const store = useEventSummaryStore()
    await Promise.all([store.loadSummary(), store.loadSummary()])
    await vi.advanceTimersByTimeAsync(500)
    expect(api).toHaveBeenCalledTimes(1)
    filters.resetFilters()
    await vi.advanceTimersByTimeAsync(300)
    expect(api).toHaveBeenCalledTimes(2)
  })

  it('ignores obsolete success and failure even if the transport ignores abort', async () => {
    vi.useFakeTimers()
    let resolveOld!: (value: ReturnType<typeof summary>) => void
    api.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    const store = useEventSummaryStore()
    await vi.advanceTimersByTimeAsync(0)
    const signal = api.mock.calls[0]?.[1].signal as AbortSignal
    useFiltersStore().eventCategories = [1]
    api.mockResolvedValue(summary(3))
    await vi.advanceTimersByTimeAsync(0)
    expect(signal.aborted).toBe(true)
    expect(store.totalEventCount).toBe(3)
    resolveOld(summary(999))
    await flushPromises()
    expect(store.totalEventCount).toBe(3)

    let rejectOld!: (error: Error) => void
    api.mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject }))
    useFiltersStore().eventCategories = [2]
    await vi.advanceTimersByTimeAsync(0)
    useFiltersStore().eventCategories = [3]
    api.mockResolvedValue(summary(4))
    await vi.advanceTimersByTimeAsync(0)
    rejectOld(new Error('obsolete'))
    await flushPromises()
    expect(store.totalEventCount).toBe(4)
    expect(store.error).toBeNull()
  })

  it('keeps the count unknown on error and can retry', async () => {
    api.mockResolvedValue(summary(10))
    const store = useEventSummaryStore()
    await store.loadSummary()
    useFiltersStore().eventSearch = 'changed'
    api.mockRejectedValue(new Error('offline'))
    await store.loadSummary()
    expect(store.totalEventCount).toBeNull()
    expect(store.error).toBeTruthy()
    expect(store.loading).toBe(false)
    api.mockResolvedValue(summary(2))
    await store.loadSummary()
    expect(store.totalEventCount).toBe(2)
    expect(store.error).toBeNull()
  })
})

describe('applied filter snapshots', () => {
  it('keeps an independent applied snapshot until finishing and preserves portal scope on reset', async () => {
    const filters = useFiltersStore()
    filters.eventCategories = [1]
    filters.eventPortalUuid = 'portal'
    const editing = useEventFilterEditingStore()
    editing.beginMobileFilterEditing()
    filters.eventCategories.push(2)
    filters.eventSearch = 'draft'
    const { build } = useEventQueryParams()
    const applied = await build({ filterSnapshot: editing.appliedFilters })
    const draft = await build()
    expect(applied.get('categories')).toBe('1')
    expect(applied.has('search')).toBe(false)
    expect(draft.get('categories')).toBe('1,2')
    expect(draft.get('search')).toBe('draft')
    filters.resetFilters()
    expect(filters.eventPortalUuid).toBe('portal')
    editing.finishMobileFilterEditing()
    const committed = await build({ filterSnapshot: editing.appliedFilters })
    expect(committed.has('categories')).toBe(false)
    expect(committed.get('portal')).toBe('portal')
  })

  it('does not mix fields changed while geolocation is pending', async () => {
    let resolvePosition!: (position: GeolocationPosition) => void
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (resolve: typeof resolvePosition) => { resolvePosition = resolve } } })
    const filters = useFiltersStore()
    filters.eventLocationFlag = true
    filters.eventTypeIds = [1]
    const { build } = useEventQueryParams()
    const request = build()
    filters.eventTypeIds = [2]
    resolvePosition({ coords: { latitude: 54, longitude: 9 } } as GeolocationPosition)
    expect((await request).get('event_types')).toBe('1')
  })
})
