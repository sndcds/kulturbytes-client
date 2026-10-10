import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, nextTick, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import EventFilters from '../../app/components/filters/EventFilters.vue'
import { useMobileViewport } from '../../app/composables/useMobileViewport'

vi.mock('../../app/components/filters/EventFiltersMobile.vue', () => ({
  default: { template: '<div data-mobile-filter />' },
}))
vi.mock('../../app/components/filters/EventFiltersDesktop.vue', () => ({
  default: { template: '<div data-desktop-filter />' },
}))

describe('responsive filter entry point', () => {
  it('mounts only one component and follows media-query changes', async () => {
    let listener!: () => void
    const remove = vi.fn()
    const media = {
      matches: true,
      addEventListener: (_: string, callback: () => void) => { listener = callback },
      removeEventListener: remove,
    }
    vi.stubGlobal('useMobileViewport', useMobileViewport)
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList)
    const wrapper = mount(EventFilters)
    await nextTick()
    expect(wrapper.findAll('[data-mobile-filter]')).toHaveLength(1)
    expect(wrapper.findAll('[data-desktop-filter]')).toHaveLength(0)
    media.matches = false
    listener()
    await nextTick()
    expect(wrapper.findAll('[data-mobile-filter]')).toHaveLength(0)
    expect(wrapper.findAll('[data-desktop-filter]')).toHaveLength(1)
    media.matches = true
    listener()
    await nextTick()
    expect(wrapper.findAll('[data-mobile-filter]')).toHaveLength(1)
    expect(wrapper.findAll('[data-desktop-filter]')).toHaveLength(0)
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('change', listener)
  })

  it('keeps server markup and the first hydration render independent of the viewport', async () => {
    const component = defineComponent({ setup() {
      const { isMobile } = useMobileViewport()
      return () => h('span', isMobile.value === null ? 'unknown' : isMobile.value ? 'mobile' : 'desktop')
    } })
    const html = await renderToString(createSSRApp(component))
    expect(html).toBe('<span>unknown</span>')
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    } as unknown as MediaQueryList)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp(component)
    app.mount(container)
    await nextTick()
    expect(container.textContent).toBe('mobile')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
    container.remove()
    warn.mockRestore()
    error.mockRestore()
  })
})
