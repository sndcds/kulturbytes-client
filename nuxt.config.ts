export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: '%s – kulturbytes',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        {
          rel: 'preload',
          href: '/fonts/Albert_Sans/AlbertSans-VariableFont_wght.ttf',
          as: 'font',
          type: 'font/ttf',
          crossorigin: 'anonymous'
        },
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
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
    customRoutes: 'page',
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
      apiUrl: 'http://localhost:9090/' // http://localhost:9090/, https://api.kulturbytes.de/
    }
  },
})
