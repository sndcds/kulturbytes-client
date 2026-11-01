import { test, expect, type Page } from '@playwright/test'
import { portalHierarchy } from '../fixtures/portalGeometries'

const portalUuid = '019a1dc8-0000-7000-8000-000000000001'

async function setup(
  page: Page,
  geometry: ReturnType<typeof portalHierarchy> | null = portalHierarchy(),
  failGeometries = false,
) {
  const requests: string[] = []
  const browserErrors: string[] = []
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('console', message => {
    if (/hydration/i.test(message.text())) browserErrors.push(message.text())
  })
  await page.route('**/plausible.oklabflensburg.de/**', route => route.abort())
  await page.route('**/versatiles/versatiles-style.json', route => route.fulfill({ json: {
    version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f3f4f6' } }],
  } }))
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url())
    requests.push(url.pathname)
    let data: unknown = {}
    if (url.pathname === '/api/portal2/test-portal') {
      data = { uuid: portalUuid, slug: 'test-portal', name: 'Testportal', description: 'Kultur in der Region' }
    } else if (url.pathname === `/api/portal/${portalUuid}/geometries`) {
      if (failGeometries) {
        await route.fulfill({ status: 400, json: { message: 'Unavailable' } })
        return
      }
      data = { geometry }
    } else if (url.pathname === '/api/events') {
      data = { events: [], last_event_date_uuid: null, last_event_start_at: null }
    } else if (url.pathname === '/api/events/type-summary') {
      data = { total_event_count: 0, type_summary: [], genre_summary: [] }
    } else if (url.pathname === '/api/event/type-genre-lookup') {
      data = { de: { types: {} }, da: { types: {} }, en: { types: {} } }
    }
    await route.fulfill({ json: { data } })
  })
  // Navigate in the running app so the browser can mock the portal API, including slug resolution.
  await page.goto('/de')
  await page.waitForFunction(() => !!(document.getElementById('__nuxt') as HTMLElement & {
    __vue_app__?: unknown
  }).__vue_app__)
  await page.evaluate(async () => {
    const root = document.getElementById('__nuxt') as HTMLElement & {
      __vue_app__: { config: { globalProperties: { $router: { push: (path: string) => Promise<unknown> } } } }
    }
    await root.__vue_app__.config.globalProperties.$router.push('/de/portal/test-portal')
  })
  await expect(page.getByRole('heading', { name: 'Testportal', exact: true })).toBeVisible()
  return { requests, browserErrors, recoverGeometries: () => { failGeometries = false } }
}

test('one interactive map per child type supports polygon selection and the entire area', async ({ page }, testInfo) => {
  const { requests, browserErrors } = await setup(page)
  expect(requests.filter(path => path.endsWith('/geometries'))).toEqual([`/api/portal/${portalUuid}/geometries`])
  const maps = page.locator('.portal-geometry-map')
  await expect(maps).toHaveCount(2)
  const districts = page.getByRole('region', { name: 'city-district', exact: true })
  const villages = page.getByRole('region', { name: 'village', exact: true })
  await expect(districts.locator('option')).toHaveText(['Gesamter Bereich', 'West', 'Ost'])
  await expect(villages.locator('option')).toHaveText(['Gesamter Bereich', 'Dorf'])

  const canvas = districts.locator('canvas')
  await expect(canvas).toBeVisible()
  // The maps initially fit the main geometry; a point just left of its center is in West.
  await expect(async () => {
    const bounds = await canvas.boundingBox()
    await canvas.click({ position: { x: bounds!.width * .47, y: bounds!.height * .5 } })
    await expect(districts.getByRole('combobox')).toHaveValue('district-west', { timeout: 1000 })
  }).toPass()
  await villages.getByRole('combobox').selectOption('village')
  await expect(districts.getByRole('combobox')).toHaveValue('')
  await expect(villages.getByRole('combobox')).toHaveValue('village')
  await villages.getByRole('button', { name: 'Gesamter Bereich', exact: true }).click()
  await expect(villages.getByRole('combobox')).toHaveValue('')

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: testInfo.outputPath('portal-geometries.png'), fullPage: true })
  expect(browserErrors).toEqual([])
})

test('a portal without geometries keeps its content and renders no maps', async ({ page }) => {
  const { browserErrors } = await setup(page, null)
  await expect(page.locator('.portal-geometry-map')).toHaveCount(0)
  await expect(page.locator('.kbts-venue-description')).toContainText('Kultur in der Region')
  expect(browserErrors).toEqual([])
})

test('a failed geometry request can be retried without hiding the portal', async ({ page }) => {
  const { recoverGeometries, browserErrors } = await setup(page, portalHierarchy(), true)
  await expect(page.getByRole('status')).toContainText('Die Bereiche konnten nicht geladen werden.')
  await expect(page.getByRole('heading', { name: 'Testportal', exact: true })).toBeVisible()
  recoverGeometries()
  await page.getByRole('button', { name: 'Erneut versuchen', exact: true }).click()
  await expect(page.locator('.portal-geometry-map')).toHaveCount(2)
  expect(browserErrors).toEqual([])
})
