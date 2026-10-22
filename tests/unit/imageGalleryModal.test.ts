import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ImageGalleryModal from '../../app/components/ui/ImageGalleryModal.vue'

const images = [0, 1, 2].map(index => ({
  uuid: `image-${index}`,
  identifier: index === 0 ? 'main' : `gallery_image_${index}`,
  url: `https://example.com/image-${index}`,
  alt: `Image ${index + 1}`,
  credit: `Photographer ${index + 1}`,
}))
let wrapper: VueWrapper | undefined

function open(initialIndex = 0, items = images) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  wrapper = mount(ImageGalleryModal, {
    props: { images: items, initialIndex, title: 'Event title' },
    attachTo: document.body,
  })
  return wrapper
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

describe('image gallery modal', () => {
  it('opens on the selected image, preserving its aspect ratio and credit', () => {
    const modal = open(1)
    expect((modal.element as HTMLDialogElement).open).toBe(true)
    expect(modal.get('.image-gallery-modal__image').attributes()).toMatchObject({
      src: 'https://example.com/image-1?width=1600', alt: 'Image 2',
    })
    expect(modal.get('figcaption').text()).toBe('Photographer 2')
    expect(modal.findAll('[aria-pressed="true"]')).toHaveLength(1)
    expect(modal.findAll('.image-gallery-modal__dot')[1]!.attributes('aria-pressed')).toBe('true')
    expect(document.body.style.position).toBe('fixed')
  })

  it('navigates using dots and arrow keys, wrapping at either end', async () => {
    const modal = open()
    await modal.findAll('.image-gallery-modal__dot')[2]!.trigger('click')
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 3')
    await modal.trigger('keydown', { key: 'ArrowRight' })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 1')
    await modal.trigger('keydown', { key: 'ArrowLeft' })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 3')
  })

  it('swipes horizontally while ignoring small, vertical, cancelled, and multi-pointer gestures', async () => {
    const modal = open()
    const stage = modal.get('.image-gallery-modal__stage')
    const pointer = { pointerId: 1, isPrimary: true, button: 0, clientX: 200, clientY: 100 }
    await stage.trigger('pointerdown', pointer)
    await stage.trigger('pointerup', { ...pointer, clientX: 100 })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 2')
    await stage.trigger('pointerdown', pointer)
    await stage.trigger('pointerup', { ...pointer, clientX: 300 })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 1')
    for (const end of [{ clientX: 180 }, { clientX: 100, clientY: 250 }]) {
      await stage.trigger('pointerdown', pointer)
      await stage.trigger('pointerup', { ...pointer, ...end })
    }
    await stage.trigger('pointerdown', pointer)
    await stage.trigger('pointercancel', pointer)
    await stage.trigger('pointerup', { ...pointer, clientX: 100 })
    await stage.trigger('pointerdown', pointer)
    await stage.trigger('pointerdown', { ...pointer, pointerId: 2, isPrimary: false })
    await stage.trigger('pointerup', { ...pointer, clientX: 100 })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Image 1')
  })

  it.each(['button', 'backdrop', 'Escape', 'cancel'] as const)('closes via %s and restores focus, scroll, and styles', async method => {
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()
    document.body.style.overflow = 'auto'
    document.documentElement.style.scrollbarGutter = 'stable'
    const modal = open()
    await modal.get('.image-gallery-modal__image').trigger('click')
    expect(modal.emitted('close')).toBeUndefined()
    if (method === 'button') await modal.get('.image-gallery-modal__close').trigger('click')
    else if (method === 'backdrop') await modal.trigger('click')
    else if (method === 'Escape') await modal.trigger('keydown', { key: 'Escape' })
    else await modal.trigger('cancel')
    expect(modal.emitted('close')).toHaveLength(1)
    expect((modal.element as HTMLDialogElement).open).toBe(false)
    expect(document.body.style.position).toBe('')
    expect(document.body.style.overflow).toBe('auto')
    expect(document.documentElement.style.scrollbarGutter).toBe('stable')
    expect(window.scrollTo).toHaveBeenCalled()
    expect(document.activeElement).toBe(opener)
    document.body.style.overflow = ''
    document.documentElement.style.scrollbarGutter = ''
  })

  it('shows a single image without navigation and uses the title when alt text is absent', async () => {
    const modal = open(0, [{ ...images[0]!, alt: '', credit: '' }])
    expect(modal.find('.image-gallery-modal__navigation').exists()).toBe(false)
    expect(modal.find('figcaption').exists()).toBe(false)
    await modal.trigger('keydown', { key: 'ArrowRight' })
    expect(modal.get('.image-gallery-modal__image').attributes('alt')).toBe('Event title')
  })

  it('releases the scroll lock when unmounted during navigation', () => {
    const modal = open()
    modal.unmount()
    wrapper = undefined
    expect(document.body.style.position).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
  })
})
