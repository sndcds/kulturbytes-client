export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/fonts.scss',
    '~/assets/css/map.scss',
    '~/assets/css/event.scss',
    '~/assets/css/main.scss',
    'maplibre-gl/dist/maplibre-gl.css'
  ],

  ssr: true,
  pages: true,

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  vite:{
    optimizeDeps:{
      include:[
        'maplibre-gl',
        'vue-maplibre-gl'
      ]
    }
  },

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'de',
    locales: [
      {
        code: 'de',
        name: 'Deutsch',
        file: 'de.json'
      },
      {
        code: 'da',
        name: 'Dansk',
        file: 'da.json'
      },
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      }
    ],

    langDir: 'locales/',
  },

  runtimeConfig: {
    public: {
      apiUrl: 'http://localhost:9090/' // http://localhost:9090/, https://api.kulturbytes.de/
    }
  },
})
