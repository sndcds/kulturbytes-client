# Working on kulturbytes-client

## Purpose

This is kulturbytes' public cultural events and venue frontend: a multilingual Nuxt SSR application consuming the Uranus API. Search visibility is a product requirement. Preserve server-rendered content, localized routes and metadata when changing public pages.

## Quick Start

Use Node.js **22.18+ within Node 22** (CI uses Node 22), and the exact pnpm version in `package.json#packageManager`. Nuxt's Node minimum is 22.12, but locked Babel 8 packages require 22.18. Other compatible Node lines are listed in `package.json#engines`; do not assume every higher major is supported.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Required quality checks, identical to CI:

```bash
pnpm typecheck
pnpm test
pnpm build
```

`pnpm check` runs those three commands in sequence. `pnpm preview` previews the production build. `pnpm generate` exists, but static generation is not the primary SSR deployment model. `postinstall` runs `nuxt prepare`; never commit generated `.nuxt/` or `.output/` files.

## Tech Stack

Nuxt 4, Vue 3, TypeScript, Pinia with persisted state, Nuxt i18n / vue-i18n, MapLibre GL and SCSS. `vue-maplibre-gl` is installed; existing map components primarily wrap MapLibre directly. Unit tests use Vitest with the Node environment.

## Repository Map

| Path | Responsibility |
| --- | --- |
| `nuxt.config.ts` | SSR, modules, i18n routes, global head/CSS, public runtime config |
| `app/pages/` | File-based routes, page data fetching and SEO |
| `app/layouts/` | Default and full-height map layouts; site JSON-LD |
| `app/components/` | Event, filter, venue, map, navigation and shared UI components |
| `app/composables/` | Filter queries/encoding, portals, Markdown, date adapters, maps, theme |
| `app/stores/` | Shared filters, summaries, lookups, map viewport and theme |
| `app/types/` | Domain types and API response envelopes |
| `app/utils/` | Pure date, text, image, URL, UUID and filter support utilities |
| `app/plugins/` | `$api` injection and client-only DOMPurify injection |
| `app/constants/` | Link icon definitions |
| `app/assets/css/` | Global SCSS, theme tokens and domain layouts |
| `app/assets/{about,legal,privacy,terms}/` | Trusted, checked-in localized HTML |
| `i18n/locales/` | German, Danish and English JSON translations |
| `public/` | Static images, fonts, icons, map styles, robots and sitemaps |
| `types/` | Nuxt/runtime API type augmentations |
| `tests/unit/` | Pure logic tests without live APIs or browser setup |
| `.github/` | Quality/security workflows, Dependabot and PR template |

## Nuxt Architecture, Pages and Routing

- Use Nuxt 4's `app/` directory and file routing. Do not add a separate router layer.
- Use Composition API and `<script setup lang="ts">`. Nuxt auto-imports Vue APIs, application composables/utilities and configured Pinia stores. Pure utilities and unit tests should use explicit imports.
- Reuse `defineI18nRoute` for translated path segments and `useLocalePath` / `useSwitchLocalePath` for links. Preserve route parameter names and UUID/slug distinctions.
- Routes cover events and individual dates, country/state/region discovery, venues and their map, portals, and informational/contact/legal pages. `app/pages/test/[slug].vue` is an existing public route, not test infrastructure.
- New public pages must support SSR, all locales, meaningful loading/error/empty states and the SEO checklist below. Browser APIs belong in client components, mounted hooks or user event handlers guarded against SSR.
- Detail and geographic pages generally await `useAsyncData`; `EventsView.vue` instead loads paginated events on mount and through an `IntersectionObserver`. Do not assume its event list is present in SSR HTML.
- Preserve `createError` status handling where implemented and clean up watchers, observers, listeners and rendered map UI. Never hide a failed API request behind a false success state.

## SEO and Structured Data

**Every new indexable public page must follow the existing full SEO pattern; a title alone is insufficient.** Inspect a relevant detail/discovery page before implementing metadata:

- `app/pages/events/index.vue`: collection metadata, social cards and breadcrumbs.
- `app/pages/event/[event_uuid]/[date_identifier].vue`: Event JSON-LD and event metadata.
- `app/pages/venue/[venue_identifier].vue`: Place JSON-LD and venue metadata.
- `app/pages/events/[country]/[state]/[region]/index.vue`: regional collections and pagination links.
- `app/pages/portal/[portal_identifier]/`: portal metadata and event collections.

Check title, description, absolute canonical URL, localized URL, Open Graph title/description/URL/image, Twitter Cards and appropriate indexability. Set language attributes where appropriate. Global titles use `%s – kulturbytes` in `nuxt.config.ts`; do not duplicate the suffix. Reuse `ogLocale`, `truncateText`, `imageUrl` and Nuxt head composables. Prefer reactive values when a route or locale can change without remounting.

Build absolute URLs using `runtimeConfig.public.siteUrl` and localized routes. Existing canonicals differ: some use `route.fullPath`, detail pages use `route.path`. Deliberately review query/pagination semantics; do not copy query-bearing canonicals blindly. There is currently **no explicit shared hreflang/alternate implementation or `useLocaleHead` call**. Check alternates when changing localized SEO and use Nuxt i18n facilities if adding them; do not claim they already exist.

JSON-LD currently comes from `useHead` script entries with `type: 'application/ld+json'`, serialized using `JSON.stringify` in `children` or `innerHTML`. Layouts emit Organization/WebSite graphs; pages add Event, Place, CollectionPage and BreadcrumbList objects. Portal event pages have collections/breadcrumbs, while the portal landing page has no dedicated schema object.

`useStructuredData.ts` returns Organization/WebSite objects but currently has **no callers**; it does not insert head scripts. Reuse its applicable objects or the existing page schemas instead of introducing another competing schema system. Reuse `eventSchemaStatus` for release-state mappings. Only use valid Schema.org properties backed by actual API data. Do not invent dates, organizer attributes or portal-specific schemas. Serialize untrusted strings safely for an HTML script context: `JSON.stringify` alone is not proof against an embedded `</script>` sequence. Verify the resulting SSR HTML when changing JSON-LD.

Known SEO debt is not a template for new code: title-only informational pages, duplicate organization graphs, a hardcoded event-schema URL, missing alternates and outdated static sitemap paths should be addressed in focused follow-ups.

## API Integration and Contract

Use `const { $api } = useNuxtApp()`. `app/plugins/api.ts` builds `$fetch.create({ baseURL: config.public.apiUrl })` and handles request headers. No component should hardcode the API origin. The access-token cookie is currently forwarded only in the browser; do not assume authenticated SSR or change that behavior incidentally.

`runtimeConfig.public.siteUrl` and `.apiUrl` are overridden by `NUXT_PUBLIC_SITE_URL` and `NUXT_PUBLIC_API_URL`. Public config is browser-visible and cannot hold secrets. Supply the API origin; call paths already start with `/api/`.

- Pages use typed `$api<T>` calls inside `useAsyncData`; stores and interaction handlers call `$api<T>` directly. There is no separate `useFetch` abstraction to adopt.
- Reuse `app/types/api.ts#ApiResponse<T>` and the event, calendar, venue, portal and geolist response types. Some endpoints have specialized envelopes; inspect their existing caller first.
- Pass endpoint-specific language parameters using `query: { lang: locale.value }`. Include changing route/locale/filter inputs in async-data keys or watches where relevant.
- Lookup stores cache loaded event types/languages. `usePortal` caches the active portal with `useState` and discards stale activation responses. There is no general application HTTP-cache policy.
- Preserve loading/error flags and `finally` cleanup. Contact submission has explicit handling for HTTP 429; detail pages use error status codes. Avoid sensitive payloads in logs.

[Uranus](https://github.com/sndcds/uranus) owns the backend contract. Do not rename response fields, reinterpret UUIDs, invent date/time formats or alter filter/cursor parameters. Distinguish event UUIDs, event-date UUIDs and slug/identifier paths. If a contract must change, inspect backend and frontend together and coordinate the change explicitly.

## i18n

The configured locales are `de`, `da`, `en`; default is `de`, strategy is `prefix`, and `customRoutes` is `page`. Even German routes are prefixed. Root language detection uses the `kulturbytes_locale` cookie.

Do not hardcode new visible UI text. Add matching keys to **all three** files in `i18n/locales/`, preserving the existing key hierarchy. Generate URLs through Nuxt i18n helpers instead of assembling language prefixes manually. Localized static informational HTML lives under `app/assets/`.

## State and Event Filters

Use local refs/computed values for temporary component UI state. Use Pinia for shared filters, lookup data and persistent application state; do not create a global store for each toggle.

The stores are `filtersStore`, `eventSummaryStore`, `eventTypesStore`, `languageLookupStore`, `mapsStore` and `themeStore`. Filters and map viewport use persisted state. Theme wraps `useTheme` and its browser storage behavior.

Keep filter state, shared URLs and API queries synchronized:

- `filtersStore` builds/applies filter payloads and resolves date spans.
- `cleanObject` removes empty nested values while preserving `false` and `0`.
- `useEventFilterEncoding` encodes UTF-8 JSON strings to base62 for the `filter` URL parameter. Decoding can throw; malformed JSON also needs validation.
- `EventFilters.vue` creates share URLs; event/portal event pages restore them.
- `useEventQueryParams` is the shared query builder used by `EventsView` and the summary store. It handles comma-separated category/type/genre values, wildcard locations, price/age/date filters, portal IDs, cursor pagination and location radius conversion from kilometres to metres.

Reuse these helpers. Do not add a second encoding format or build independent query logic for summaries. URL payloads are untrusted input; validate their shape before applying them when working on this boundary.

## Maps and Browser Lifecycle

Reuse the existing `.client.vue` map components, `useMapLibre`, `useMapLibreLayers`, `useMapLibreMarkers` and `mapsStore`. Do not add another map library. Map styles and marker images are in `public/versatiles/` and `public/map/`; shared map SCSS is in `app/assets/css/map.scss`.

Keep MapLibre instances out of deep Vue proxies (`shallowRef` or an ordinary variable). Map creation happens on mount, with browser-only imports as needed. Never access `window`, `document`, geolocation or MapLibre browser APIs unguarded during SSR. `useImageSize` also uses the browser `Image` constructor; account for SSR at its call sites.

Maintain source/layer identifiers across updates and theme style reloads. Remove dependent layers before removing sources; remove popups and mounted Vue popup content, markers, event listeners and the map on teardown. Preserve saved viewports and light/dark styles.

## Markdown, HTML and Security

Never render user/API HTML directly through `v-html`. Event, venue and portal descriptions use `useMarkdown`: markdown-it has `html: false`, linkification and typography enabled. The browser then applies `$sanitizeHtml` from `dompurify.client.ts`. SSR returns markdown-it output without DOMPurify; raw HTML stays disabled. `sanitize-html` is installed but has no application callers. Do not describe it as an active server sanitization layer.

The informational pages render trusted, checked-in `?raw` HTML assets; this is not a pattern for external HTML. Reuse the existing Markdown pipeline and preserve its HTML restrictions. If external rich HTML is required, design and verify sanitization on both server and client; never remove security checks to simplify rendering.

No committed secrets, sensitive logging, `eval` or unsafe dynamic script injection. Validate externally supplied link protocols; `ensureHttpOrHttps` only normalizes text and is **not** a security validator. Keep external tab links appropriately isolated. Check CSP compatibility when changing scripts; existing inline analytics/head scripts do not imply a complete CSP policy.

## Styling, Components, TypeScript and Accessibility

Search `app/components/` before adding a component. Prefer small Composition API components with typed props/emits and limited side effects. Reuse `@lucide/vue` and existing icon components/registries.

Reuse `--kbts-*` CSS custom properties from `main.scss`, existing responsive breakpoints and domain SCSS. Preserve `data-theme` behavior and mobile navigation spacing. Do not add a CSS framework or unnecessary inline styles.

Type new code and API responses using existing interfaces. Prefer `unknown` with narrowing to `any`; handle nullable data. Do not add `@ts-ignore`, disable strict checking or exclude failing application files to make CI pass. `tsconfig.json` extends Nuxt's generated config; regenerate it through Nuxt commands rather than editing `.nuxt/`.

Use semantic HTML, real buttons, form labels, keyboard navigation, visible focus, useful alt text and descriptive controls/links. Add ARIA only where needed. Check changed UI in all locales and themes; do not claim WCAG compliance without evidence.

## Dependencies and Scope

pnpm is the only package manager. Check existing libraries before adding dependencies, especially maps, i18n, Markdown, sanitization, state or icons. Add browser/Nuxt test utilities only when tests actually require them. Update `pnpm-lock.yaml` with pnpm and review the diff; do not rewrite unrelated resolutions. `pnpm-workspace.yaml` explicitly allows builds for `@parcel/watcher` and `esbuild`; inspect any newly requested build script before allowing it.

Keep changes focused: no incidental dependency upgrades, API redesign, cosmetic mass edits or unrelated refactors. Record out-of-scope findings in the PR's follow-up recommendations. Never commit generated files or a second lockfile.

## Before Finishing

Run `pnpm install --frozen-lockfile`, then:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Use `tests/unit/*.test.ts` for deterministic logic tests. The Vitest config explicitly exercises the SSR Markdown path and does not provide Nuxt auto-imports or a DOM. Test observable behavior and meaningful edge cases rather than implementation details. For page/map changes, also verify relevant SSR responses and browser behavior; unit tests cannot establish those properties.

Keep scripts, this file, README and `.github/workflows/ci.yml` synchronized. CI is a blocking sequence of typecheck, tests and build; do not add `continue-on-error` or test skipping. CodeQL and Dependency Review provide separate security checks. `pnpm audit --prod --audit-level high` is currently diagnostic only because the baseline has high/critical advisories; dependency remediation belongs in a dedicated follow-up.

Use a focused branch and meaningful commits, then open a PR against `main` with exact check results, behavior changes and limitations. Include accessibility/SEO impact and screenshots when UI is affected. Workflows run with minimal permissions, without PR secrets or `pull_request_target`; deployment is separate.
