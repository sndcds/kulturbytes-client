export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        {
          rel: 'preload',
          href: '/fonts/AlbertSans-VariableFont_wght.ttf',
          as: 'font',
          type: 'font/ttf',
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  css: [
    '~/assets/css/fonts.scss',
    '~/assets/css/map.scss',
    '~/assets/css/venue.scss',
    '~/assets/css/event.scss',
    '~/assets/css/geolist.scss',
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

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'kulturbytes_locale',
      redirectOn: 'root',
      fallbackLocale: 'de'
    },

    langDir: 'locales/'
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://kulturbytes.de',
      apiUrl: 'https://api.kulturbytes.de/' // http://localhost:9090/, https://api.kulturbytes.de/
    }
  },
})
