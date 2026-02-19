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

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        "/viewconf/": {
          target: process.env.NUXT_PUBLIC_GIT_VIEW_CONF_URL || '',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/viewconf\//, "")
        },
      }
    },
  },

  modules: [
    '@pinia/nuxt', 
    '@nuxt/eslint'
  ],

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
