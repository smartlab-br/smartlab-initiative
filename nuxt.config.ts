// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  build: {
    transpile: ['vuetify'],
  },

  routeRules: {
    '/viewconf/**': {
      proxy: `${process.env.NUXT_PUBLIC_GIT_VIEW_CONF_URL || ''}/**`
    }
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    ssr: {
      noExternal: ['leaflet', 'leaflet.markercluster', 'leaflet.heat', 'leaflet-curve'],
    },
  },

  modules: ['@pinia/nuxt', '@nuxt/eslint', '@vueuse/nuxt'],

  runtimeConfig: {
    // The private keys which are only available server-side
    datahubUrl: '',
    datahubKey: '',
    mailerUrl: '',
    mailerKey: '',
    // Keys within public are also exposed client-side
    public: {
      gitViewConfUrl: '',
      ga_id: ''
    }
  },

})