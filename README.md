# kulturbytes – Open Source Cultural Events & Venue Discovery

[![CI](https://github.com/sndcds/kulturbytes-client/actions/workflows/ci.yml/badge.svg)](https://github.com/sndcds/kulturbytes-client/actions/workflows/ci.yml)
[![CodeQL](https://github.com/sndcds/kulturbytes-client/actions/workflows/codeql.yml/badge.svg)](https://github.com/sndcds/kulturbytes-client/actions/workflows/codeql.yml)
[![Dependency Review](https://github.com/sndcds/kulturbytes-client/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/sndcds/kulturbytes-client/actions/workflows/dependency-review.yml)

**kulturbytes is an open source cultural calendar (Kulturkalender) for discovering cultural events, venues and regional cultural offerings.** It brings public event information into a multilingual interface for browsing Veranstaltungen, exploring locations on a map and finding events by date or interest.

This repository contains the public **Nuxt SSR web application**, built with Vue and TypeScript. Cultural data comes from the separate Uranus API; content management and the backend live outside this client.

**[Live application: kulturbytes.de](https://kulturbytes.de)** · [Public API](https://api.kulturbytes.de) · [Uranus backend](https://github.com/sndcds/uranus)

## Features

- Event discovery with category, event type, genre, text, age, price and location filters.
- Date ranges and calendar presets such as today, tomorrow, weekends and next week.
- Shareable encoded filters, event summary counts and infinite scrolling event lists.
- Event detail pages with dates, venue information, ticket links and ICS calendar export.
- Venue detail pages, interactive MapLibre maps and search around the current location.
- Geographical navigation through countries, states and regions, including paginated regional event listings.
- Portals with descriptions, associated events and map boundaries.
- German, Danish and English pages; responsive layouts and light/dark themes.
- Markdown descriptions, social sharing metadata and Schema.org structured data.

## Search Engine Optimization

SEO is part of the public application architecture. Nuxt renders pages on the server; event and venue details and geographical landing pages load API data with `useAsyncData`. The interactive `EventsView` list loads its events after mounting in the browser.

Discovery pages use dynamic titles and descriptions, canonical URLs, Open Graph and Twitter Cards. Nuxt i18n provides localized routes. JSON-LD describes events, venues (`Place`), collections, breadcrumbs, the website and its organization.

Coverage varies by page: informational pages currently have simpler metadata, and there is no explicit shared hreflang implementation. New public pages should follow the fuller patterns described in [AGENTS.md](AGENTS.md#seo-and-structured-data).

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Nuxt 4 with SSR and file-based routing |
| UI | Vue 3, Composition API |
| Language | TypeScript |
| State | Pinia and persisted state |
| Maps | MapLibre GL; `vue-maplibre-gl` is also installed |
| Internationalization | Nuxt i18n / vue-i18n |
| Styling | SCSS and CSS custom properties |
| Markdown | markdown-it; DOMPurify in the browser |
| Unit tests | Vitest in a Node environment |
| API | Uranus / Kulturbytes API |
| Package manager | pnpm, pinned in `package.json` |

## Architecture

```text
app/
├── pages/          # Routes and page-level data/SEO
├── layouts/        # Default and map layouts
├── components/     # Events, filters, maps, navigation and UI
├── composables/    # Shared API, filter, Markdown and map logic
├── stores/         # Pinia filters, lookups, summaries, maps and theme
├── types/          # Domain and API response types
├── utils/          # Dates, encoding support, images, URLs and text
├── plugins/        # Central $api client and client-side DOMPurify
├── constants/      # Link icon registry
└── assets/         # Global SCSS and localized static HTML
i18n/locales/       # de.json, da.json, en.json
public/            # Fonts, icons, map styles, robots and static sitemaps
types/             # Nuxt/API type augmentations
tests/unit/        # Deterministic unit tests
.github/           # CI, security workflows and contribution template
```

## Getting Started

Use **Node.js 22.18 or newer within Node 22** and the pnpm version pinned in `package.json` (currently 11.18.0). CI uses Node 22. Nuxt itself requires at least 22.12; the locked Babel 8 packages raise the Node 22 minimum to 22.18. Other engine-compatible release lines are recorded in `package.json`; CI currently validates Node 22 only.

With Node and Corepack available:

```bash
git clone https://github.com/sndcds/kulturbytes-client.git
cd kulturbytes-client
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed by Nuxt, normally `http://localhost:3000`. The default configuration reads from the public API. A local backend is optional.

## Development Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm typecheck` | Generate Nuxt types and check TypeScript/Vue |
| `pnpm test` | Run the unit test suite once |
| `pnpm build` | Build the production SSR application in `.output/` |
| `pnpm check` | Run typecheck, tests and production build in sequence |
| `pnpm preview` | Preview an existing production build |
| `pnpm generate` | Run Nuxt static generation; the primary application uses SSR |
| `pnpm postinstall` | Generate Nuxt scaffolding (`nuxt prepare`) |

Tests cover shared filter encoding, date validation/formatting, calendar presets, native country names and SSR Markdown safety. They require neither a live API nor a browser. Browser sanitization, map interactions and end-to-end navigation need separate verification.

## Configuration

`nuxt.config.ts` defines public runtime configuration. Override it through Nuxt's matching environment variable names:

| Runtime setting | Environment variable | Default |
| --- | --- | --- |
| `public.siteUrl` | `NUXT_PUBLIC_SITE_URL` | `https://kulturbytes.de` |
| `public.apiUrl` | `NUXT_PUBLIC_API_URL` | `https://api.kulturbytes.de/` |

For example, in an untracked `.env` for development:

```dotenv
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_API_URL=http://localhost:9090/
```

Use the API origin as the base URL; requests supply their own `/api/...` paths. Public runtime configuration is exposed to browsers and must contain no secrets. Nuxt reads `.env` during development/build; when running `.output/server/index.mjs`, set runtime variables in the process environment. The built server does not load `.env` automatically.

## Internationalization

German (`de`) is the default. The `prefix` strategy gives every language a URL prefix, including German. Some routes also translate their path segments, for example `/de/veranstaltungen` and `/en/events`.

Maintain new translation keys in all three files:

- [German](i18n/locales/de.json)
- [Danish](i18n/locales/da.json)
- [English](i18n/locales/en.json)

Generate links with Nuxt i18n helpers such as `useLocalePath`. Longer informational pages use localized HTML under `app/assets/`.

## Contributing

Read [AGENTS.md](AGENTS.md) for the repository's implementation rules, then create a focused branch:

```bash
git checkout -b feat/my-feature
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Open a pull request against `main` explaining the change and verification. For UI changes, include screenshots and check keyboard access, responsive behavior, all three languages and SEO impact. Keep API contract changes coordinated with Uranus.

CI runs typecheck, unit tests and a production build on pull requests and pushes to `main`. CodeQL analyzes JavaScript/TypeScript on `main` pushes, PRs targeting `main` and weekly. Dependency Review rejects newly introduced high/critical vulnerabilities. Dependabot checks npm/pnpm dependencies and GitHub Actions weekly. These workflows do not deploy the application.

`pnpm audit --prod --audit-level high` is a manual diagnostic, not a blocking CI gate: the September 2026 baseline contains existing high/critical advisories that require a dedicated dependency update. Dependency Review evaluates PR changes and does not certify the entire installed tree.

## Related Projects and Community

### Uranus

[Uranus](https://github.com/sndcds/uranus) provides the backend API and cultural data model. This client consumes that contract to present events and venues to the public.

The project's [About content](app/assets/about/en.html) describes a volunteer effort that began at **OK Lab Flensburg**. The application identifies **DatenSindDaten e. V.** as its operator. Contributions to code, translations, documentation and public cultural information are welcome.

The project describes itself as open source, but this repository currently has no top-level software license file. Maintainers still need to clarify licensing; this README does not assign a license to code, event data or media.
