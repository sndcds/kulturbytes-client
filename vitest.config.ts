import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  // Exercise the SSR Markdown path without booting Nuxt or a browser.
  define: {
    'import.meta.client': false,
  },
})
