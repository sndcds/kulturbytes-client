import { vi } from 'vitest'

export const api = vi.fn()
export const useNuxtApp = () => ({ $api: api })
