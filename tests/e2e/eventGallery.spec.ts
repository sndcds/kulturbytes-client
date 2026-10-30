import { test, expect, type Page } from '@playwright/test'

const images = [0, 1, 2, 3].map(index => ({
  uuid: `image-${index}`,
  identifier: index === 0 ? 'main' : `gallery_image_${index}`,
  url: `https://api.kulturbytes.de/api/image/gallery-${index}`,
  alt: `Bild ${index + 1}`,
  creator: `Fotograf ${index + 1}`,
}))
const event = {
  uuid: '00000000-0000-4000-8000-000000000001',
  title: 'Event mit Bildergalerie',
  description: 'Beschreibung des Events.',
  tags: [], languages: [], event_types: [], logo_mode: 0,
  price_type: null, ticket_flags: [], event_links: [], further_dates: [],
  source_link: 'https://example.com/event',
  images: Object.fromEntries(images.map(image => [image.identifier, image])),
  date: {
    uuid: '00000000-0000-4000-8000-000000000002',
    slug: '202610221930', release_status: 'released',
    start_date: '2026-10-22', start_time: '19:30',
    end_date: '2026-10-22', end_time: '21:30',
    venue_name: 'Test venue', venue_country: 'DEU', venue_logos: {},
  },
}

async function setup(page: Page, singleImage = false) {
  const browserErrors: string[] = []
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('console', message => { if (/hydration/i.test(message.text())) browserErrors.push(message.text()) })
  await page.route('**/plausible.oklabflensburg.de/**', route => route.abort())
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname.startsWith('/api/image/')) {
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#467d68"/></svg>' })
    } else if (url.pathname === `/api/event/${event.uuid}/date/${event.date.slug}`) {
      await route.fulfill({ json: { data: { ...event, images: singleImage ? { main: images[0] } : event.images } } })
    } else if (url.pathname === '/api/events') {
      const items = url.searchParams.has('last_event_date_uuid') ? [] : [{
        ...event, ...event.date, uuid: event.uuid, date_uuid: event.date.uuid, date_slug: event.date.slug,
        release_status: 'released', categories: [1],
      }]
      await route.fulfill({ json: { data: {
        events: items, last_event_date_uuid: 'cursor', last_event_start_at: '2026-10-22T19:30',
        pagination_reference_date: url.searchParams.get('start') ?? '2026-10-22',
      } } })
    } else if (url.pathname === '/api/events/type-summary') {
      await route.fulfill({ json: { data: { total_event_count: 1, type_summary: [], genre_summary: [] } } })
    } else if (url.pathname === '/api/event/type-genre-lookup') {
      await route.fulfill({ json: { data: { de: { types: {} }, da: { types: {} }, en: { types: {} } } } })
    } else await route.fulfill({ json: { data: {} } })
  })
  // Enter through client-side navigation so the browser can mock the detail API.
  await page.goto('/de')
  await page.locator('.kbts-events-view-card').first().click()
  await expect(page.locator('h1')).toHaveText(event.title)
  return browserErrors
}

test('clicked images open in the modal; dots and arrow keys navigate all event images', async ({ page }) => {
  const browserErrors = await setup(page)
  const thumbnail = page.locator('.kbts-event-view-gallery-image').nth(1)
  await thumbnail.click()
  const dialog = page.getByRole('dialog', { name: 'Bildergalerie' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 3')
  await expect(dialog.locator('figcaption')).toHaveText('Bild: Fotograf 3')
  await expect(dialog.getByRole('button', { pressed: true })).toHaveAttribute('aria-label', 'Bild 3 von 4 anzeigen')
  await dialog.getByRole('button', { name: 'Bild 4 von 4 anzeigen' }).click()
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 4')
  await page.keyboard.press('ArrowRight')
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 1')
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 4')
  const source = await dialog.locator('.image-gallery-modal__image').getAttribute('src')
  expect(new URL(source!).searchParams.has('ratio')).toBe(false)
  await dialog.getByRole('button', { name: 'Bildansicht schließen' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(thumbnail).toBeFocused()
  await page.locator('.kbts-event-view-image-inner').click()
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 1')
  await page.keyboard.press('Escape')
  expect(browserErrors).toEqual([])
})

test('X, Escape, and outside clicks close the modal and restore scrolling and focus', async ({ page }) => {
  const browserErrors = await setup(page)
  const thumbnail = page.locator('.kbts-event-view-gallery-image').first()
  for (const method of ['X', 'Escape', 'outside']) {
    await thumbnail.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const scrollY = await page.evaluate(() => window.scrollY)
    await thumbnail.click()
    const dialog = page.getByRole('dialog', { name: 'Bildergalerie' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Bildansicht schließen' })).toBeFocused()
    await expect(page.locator('body')).toHaveCSS('position', 'fixed')
    await dialog.locator('.image-gallery-modal__image').click()
    await expect(dialog).toBeVisible()
    if (method === 'X') await dialog.getByRole('button', { name: 'Bildansicht schließen' }).click()
    else if (method === 'Escape') await page.keyboard.press('Escape')
    else await page.mouse.click(2, 2)
    await expect(dialog).toHaveCount(0)
    await expect(thumbnail).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
    expect(await page.locator('body').evaluate(element => element.style.position)).not.toBe('fixed')
  }
  expect(browserErrors).toEqual([])
})

test('touch swipes change the image in both directions', async ({ page }) => {
  const browserErrors = await setup(page)
  await page.locator('.kbts-event-view-gallery-image').first().click()
  const dialog = page.getByRole('dialog', { name: 'Bildergalerie' })
  const stage = dialog.locator('.image-gallery-modal__stage')
  const session = await page.context().newCDPSession(page)
  for (const direction of [-1, 1]) {
    const box = await stage.boundingBox()
    const x = box!.x + box!.width / 2
    const y = box!.y + box!.height / 2
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - direction * 70, y }] })
    for (let step = 1; step <= 5; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - direction * 70 + direction * step * 28, y }] })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', direction === -1 ? 'Bild 3' : 'Bild 2')
    await expect(dialog).toBeVisible()
  }
  await session.detach()
  expect(browserErrors).toEqual([])
})

test('an event with only its main image opens without navigation dots', async ({ page }) => {
  const browserErrors = await setup(page, true)
  await expect(page.locator('.kbts-event-view-gallery')).toHaveCount(0)
  await page.locator('.kbts-event-view-image-inner').click()
  const dialog = page.getByRole('dialog', { name: 'Bildergalerie' })
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.image-gallery-modal__image')).toHaveAttribute('alt', 'Bild 1')
  await expect(dialog.locator('.image-gallery-modal__navigation')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  expect(browserErrors).toEqual([])
})
