import { test, expect, type Page } from '@playwright/test'

function eventPage(search: string, paginated: boolean) {
  const events = paginated ? [] : Array.from({ length: 20 }, (_, i) => ({
    uuid: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    date_slug: `test-${i}`, title: `${search || 'Event'} ${i}`,
    start_date: '2026-10-10', start_time: '19:00', end_date: '2026-10-10', end_time: '21:00',
    venue_name: 'Test venue', venue_city: 'Flensburg', price_type: null,
    image_ai_label: null, event_types: [], categories: [1], release_status: 'released',
  }))
  return { data: { events, last_event_date_uuid: 'cursor', last_event_start_at: '2026-10-10' } }
}

async function setup(page: Page) {
  const eventRequests: URL[] = []
  const summaryRequests: URL[] = []
  const browserErrors: string[] = []
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('console', message => {
    if (/hydration/i.test(message.text())) browserErrors.push(message.text())
  })
  await page.route('**/plausible.oklabflensburg.de/**', route => route.abort())
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/events') {
      eventRequests.push(url)
      await route.fulfill({ json: eventPage(url.searchParams.get('search') ?? '', url.searchParams.has('last_event_date_uuid')) })
    } else if (url.pathname === '/api/events/type-summary') {
      summaryRequests.push(url)
      const search = url.searchParams.get('search')
      if (search === 'error') {
        await route.fulfill({ status: 400, json: { message: 'unavailable' } })
      } else {
        await route.fulfill({ json: { data: {
          total_event_count: search === 'zero' ? 0 : search ? 7 : 42,
          type_summary: Array.from({ length: 120 }, (_, i) => ({ id: i + 1, count: 1 })),
          genre_summary: [],
        } } })
      }
    } else if (url.pathname === '/api/event/type-genre-lookup') {
      const types = Object.fromEntries(Array.from({ length: 120 }, (_, i) => [i + 1, {
        name: `Langer Veranstaltungstyp ${i + 1}`, genres: { 1: 'Genre' },
      }]))
      await route.fulfill({ json: { data: { de: { types }, en: { types }, da: { types } } } })
    } else await route.fulfill({ json: { data: {} } })
  })
  await page.goto('/de')
  await expect(page.locator('.kbts-events-view-card')).toHaveCount(20)
  return { eventRequests, summaryRequests, browserErrors }
}

async function openFilters(page: Page) {
  await page.getByRole('button', { name: 'Suche', exact: true }).filter({ visible: true }).click()
}

test('mobile editing loads summaries only; reset and both apply actions have exact request counts', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 768, 'Mobile viewports')
  const { eventRequests, summaryRequests, browserErrors } = await setup(page)
  const initial = eventRequests.length
  await openFilters(page)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(page.locator('.mobile-bottom-nav')).toBeHidden()
  await expect(dialog.getByRole('status')).toHaveText('42 Ergebnisse')
  const summaries = summaryRequests.length
  await dialog.getByRole('button', { name: 'Kultur', exact: true }).click()
  await expect.poll(() => summaryRequests.length).toBe(summaries + 1)
  await dialog.getByRole('searchbox').fill('music')
  await expect(dialog.getByRole('status')).toHaveText('7 Ergebnisse')
  await dialog.getByRole('button', { name: 'Filter zurücksetzen' }).click()
  await expect(dialog.getByRole('status')).toHaveText('42 Ergebnisse')
  expect(eventRequests).toHaveLength(initial)
  await expect(dialog).toBeVisible()
  await dialog.getByRole('searchbox').fill('last keystroke')
  await dialog.getByRole('button', { name: 'Filter schließen' }).click()
  await expect(dialog).toBeHidden()
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
  expect(eventRequests.at(-1)?.searchParams.get('search')).toBe('last keystroke')
  await expect(page.locator('.mobile-bottom-nav')).toBeVisible()
  await expect(page.locator('.navigation-search--mobile-navigation')).toBeFocused()

  await openFilters(page)
  await page.getByRole('dialog').getByRole('searchbox').fill('show')
  await page.getByRole('dialog').getByRole('button', { name: 'Anzeigen', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect.poll(() => eventRequests.length).toBe(initial + 2)
  await expect(page.locator('.kbts-events-view-card')).toHaveCount(20)
  await expect(page.locator('#navigation-filters')).toBeHidden()
  const resultsTop = await page.locator('[data-event-results]').evaluate(element => element.getBoundingClientRect().top)
  expect(resultsTop).toBeGreaterThanOrEqual(0)
  expect(resultsTop).toBeLessThanOrEqual(80)
  await page.locator('.kbts-events-view-load-trigger').scrollIntoViewIfNeeded()
  await expect.poll(() => eventRequests.length).toBe(initial + 3)
  expect(eventRequests.at(-1)?.searchParams.get('last_event_date_uuid')).toBe('cursor')
  expect(browserErrors).toEqual([])
})

test('mobile footer stays visible with long filters and document scroll is restored', async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) > 768, 'Mobile viewports')
  const { eventRequests } = await setup(page)
  await page.evaluate(() => window.scrollTo(0, 250))
  const scrollY = await page.evaluate(() => window.scrollY)
  await openFilters(page)
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('tab', { name: 'Typen & Genres' }).click()
  await expect(dialog.locator('.event-type-filter .kbts-chip')).toHaveCount(120)
  const content = dialog.locator('.mobile-filter-content')
  const footer = dialog.locator('.mobile-filter-footer')
  expect(await content.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
  const header = dialog.locator('.mobile-filter-header')
  const initialTopPadding = await header.evaluate(element => parseFloat(getComputedStyle(element).paddingTop))
  const initialBottomPadding = await footer.evaluate(element => parseFloat(getComputedStyle(element).paddingBottom))
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 24, bottom: 34, left: 0, right: 0 } })
  expect(await header.evaluate(element => parseFloat(getComputedStyle(element).paddingTop))).toBe(initialTopPadding + 24)
  expect(await footer.evaluate(element => parseFloat(getComputedStyle(element).paddingBottom))).toBe(initialBottomPadding + 34)
  const before = await footer.boundingBox()
  const box = await dialog.boundingBox()
  expect(box?.y).toBe(0)
  expect(box?.width).toBe(page.viewportSize()?.width)
  expect(box?.height).toBe(page.viewportSize()?.height)
  await content.evaluate(element => { element.scrollTop = element.scrollHeight })
  const after = await footer.boundingBox()
  expect(after).toEqual(before)
  expect((after?.y ?? 0) + (after?.height ?? 0)).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0)
  expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('mobile-filter-footer.png') })
  const initial = eventRequests.length
  await dialog.getByRole('button', { name: 'Filter schließen' }).click()
  await expect(page.locator('#navigation-filters')).toBeHidden()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollY)
  expect(await page.evaluate(() => document.body.style.position)).toBe('')
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
})

test('opening mobile filters from another page suppresses the first event page', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 768, 'Mobile viewports')
  const { eventRequests, browserErrors } = await setup(page)
  await page.goto('/de/ueber')
  await expect(page.locator('.about-page')).toBeVisible()
  const initial = eventRequests.length
  await openFilters(page)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('status')).toHaveText('42 Ergebnisse')
  expect(eventRequests).toHaveLength(initial)
  await page.getByRole('dialog').getByRole('button', { name: 'Anzeigen', exact: true }).click()
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
  expect(browserErrors).toEqual([])
})

test('mobile count distinguishes loading, zero and errors; Escape applies filters', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 768, 'Mobile viewports')
  const { eventRequests } = await setup(page)
  const initial = eventRequests.length
  await openFilters(page)
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('status')).toHaveText('42 Ergebnisse')
  await dialog.getByRole('searchbox').fill('zero')
  await expect(dialog.getByRole('status')).toHaveText('Ergebnisse werden berechnet …')
  await expect(dialog.getByRole('status')).toHaveText('0 Ergebnisse')
  await dialog.getByRole('searchbox').fill('error')
  await expect(dialog.getByRole('status')).toHaveText('Ergebniszahl nicht verfügbar')
  expect(eventRequests).toHaveLength(initial)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
})

test('desktop filters still reload, reset and close without a mobile dialog', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 768, 'Desktop viewports')
  const { eventRequests, browserErrors } = await setup(page)
  const initial = eventRequests.length
  await openFilters(page)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const panel = page.locator('#navigation-filters')
  await panel.getByRole('button', { name: 'Kultur', exact: true }).click()
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
  await panel.getByPlaceholder('Wonach suchst du?').fill('desktop')
  await expect.poll(() => eventRequests.length).toBe(initial + 2)
  await panel.getByRole('button', { name: 'Alles zurücksetzen' }).click()
  await expect.poll(() => eventRequests.length).toBe(initial + 3)
  await panel.getByRole('button', { name: 'Filter schließen' }).click()
  await expect(panel).toBeHidden()
  expect(eventRequests).toHaveLength(initial + 3)
  expect(browserErrors).toEqual([])
})

test('viewport changes mount one filter component and apply a mobile session once', async ({ page }) => {
  const { eventRequests, summaryRequests, browserErrors } = await setup(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await openFilters(page)
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('42 Ergebnisse')
  const initial = eventRequests.length
  const summaries = summaryRequests.length
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('#navigation-filters .filters')).toHaveCount(1)
  await expect.poll(() => eventRequests.length).toBe(initial + 1)
  expect(summaryRequests).toHaveLength(summaries)
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.filters')).toHaveCount(1)
  expect(eventRequests).toHaveLength(initial + 1)
  await page.getByRole('dialog').getByRole('button', { name: 'Anzeigen', exact: true }).click()
  await expect.poll(() => eventRequests.length).toBe(initial + 2)
  expect(browserErrors).toEqual([])
})
