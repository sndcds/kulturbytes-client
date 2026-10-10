# kulturbytes Client

A modern Nuxt/Vue frontend for discovering and exploring cultural events.

kulturbytes Client provides a responsive interface for browsing events, filtering by categories, genres, location, dates, and other criteria. It connects to the KulturBytes API to deliver dynamic event discovery and a smooth user experience.

## Features

- Event browsing with responsive card layouts
- Advanced event filtering
    - Categories
    - Event types
    - Genres
    - Date ranges
    - Cities and locations
    - Radius-based search
- Event summaries with live counts
- Infinite scrolling event lists
- Calendar/week-based event views
- Responsive chip-based filter UI
- Image optimization and placeholders
- Multi-language support

## Tech Stack

- [Nuxt](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- SCSS
- Uranus API

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server with `pnpm dev`.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

The Playwright suite starts the production build locally and mocks API responses.
It checks 375 × 667, 390 × 844, 768 × 1024, 1024 × 768 and 1440 × 900 viewports.
Browser traces, screenshots and reports remain local and are ignored by Git.

## Responsive event filters

At widths up to 768 px, event filters open in a full viewport dialog. The existing
filter fields are the draft; a separate, non-persisted editing store keeps the
applied snapshot. Event requests and infinite scrolling pause throughout editing.
Closing, Escape and “Show results” apply all changes and load the first page once.
Reset keeps the dialog open and updates only the summary. From 769 px, the original
desktop filter component and automatic event loading are retained.

Summary requests debounce text for 300 ms, batch other changes, deduplicate loads,
and invalidate previous responses immediately. Pending or failed counts are
unknown rather than displaying an earlier value. Event queries capture all fields
before asynchronous geolocation so requests cannot mix applied and draft values.

Backend follow-up: “Creative” and “Gastronomy” need confirmed category IDs and colors
before they can be added. This client currently defines only the six existing
categories; no additional IDs are assumed.
