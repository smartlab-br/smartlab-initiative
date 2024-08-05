import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // builder: "webpack",
  devtools: { enabled: true },

  sourcemap: {
    "server": true,
    "client": true
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "Smartlab - %s",
      title: "Smartlab",
      htmlAttrs: {
        lang: "pt-br"
      },
      meta:[
        { hid: "description", name: "description", content: "Iniciativa SmartLab de Trabalho Decente Políticas Públicas de Trabalho Decente Guiadas por Dados" },
        { name: "format-detection", content: "telephone=no" },
        { name: "theme-color", content: "#E0E0E0" },
        { property: "og:title", content: "Smartlab - Promoção do Trabalho Decente" },
        { property: "og:url", content: "https://smartlabbr.org" },
        { property: "og:image", content: "https://smartlabbr.org/static/icons/smartlab.png" }
  
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/icons/smartlab.png" },
        { href: "https://fonts.googleapis.com/css?family=Material+Icons", rel: "stylesheet", type: "text/css" }
      ]  
    }
  },

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error vuetify
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    "nuxt3-leaflet",
    "nuxt-gtag",
    ["@nuxtjs/eslint-module", {}],
    "@pinia/nuxt"
  ],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      proxy: {
        "/viewconf/": { 
          target: process.env.GIT_VIEWCONF_TAG_URL, 
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/viewconf\//, "")},    
      }
    }
  },

  css: [
    "@fortawesome/fontawesome-svg-core/styles.css",
    "~/assets/smartlab.css"
  ],

  // Global CSS: https://go.nuxtjs.dev/config-css
  // css: [
  //   "~/assets/app.styl",
  //   "leaflet/dist/leaflet.css",
  //   "leaflet.markercluster/dist/MarkerCluster.css",
  //   "leaflet.markercluster/dist/MarkerCluster.Default.css"
  // ],
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  // plugins: [
  //   { src: "~/plugins/mixins/service/snackbarManager.js" },
  //   { src: "~/plugins/mixins/service/viewConfReader.js" },
  //   { src: "~/plugins/services.plugin.js" },
  //   { src: "~/plugins/models.plugin.js" },
  //   { src: "~/plugins/vue-cookies.js" },
  //   { src: "~/plugins/vuetify.js" },
  //   { src: "~/plugins/gtag.js" }
  // ],
  // Auto import components: https://go.nuxtjs.dev/config-components
  // components: {
  //   dirs: [
  //     "~/components",
  //     "~/components/card",
  //     "~/components/card/content",
  //     "~/components/card/story",
  //     "~/components/chart",
  //     "~/components/emitter",
  //     "~/components/text",
  //     "~/components/viz"
  //   ]
  // },
  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  // buildModules: [
  //   // https://go.nuxtjs.dev/eslint
  //   "@nuxtjs/eslint-module",
  //   "@nuxtjs/fontawesome",
  //   "@nuxtjs/router"
  // ],
  // fontawesome: {
  //   icons: {
  //     brands: ["faInstagram", "faGithub", "faDocker", "faCreativeCommons", "faOsi"]
  //   }
  // },
  // Modules: https://go.nuxtjs.dev/config-modules
  // modules: [
  //   // https://go.nuxtjs.dev/axios
  //   "@nuxtjs/axios"
  // ],
  // serverMiddleware: [
  //   "~/server-middleware/api.js"
  // ],
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  // axios: {
  //   baseURL: "http://localhost:3000", // Used as fallback if no runtime config is provided
  //   proxy: true
  // },
  // privateRuntimeConfig: {
  //   axios: {
  //     baseURL: process.env.BASE_URL || "http://localhost:" + (process.env.PORT || "3000")
  //   }
  // },
  // publicRuntimeConfig: {
  //   axios: {
  //     browserBaseURL: process.env.BASE_URL || "http://localhost:" + (process.env.PORT || "3000")
  //   },
  //   gitViewConfUrl: process.env.GIT_VIEWCONF_TAG_URL,
  //   ga_id: process.env.GA_ID
  // }
  runtimeConfig: {
    // The private keys which are only available server-side
    datahubUrl: process.env.DATAHUB_API_BASE_URL,
    datahubKey: process.env.DATAHUB_APP_KEY,
    mailerUrl: process.env.MAILER_API_BASE_URL,
    mailerKey: process.env.MAILER_APP_KEY,
    // Keys within public are also exposed client-side
    public: {
      gitViewConfUrl: process.env.GIT_VIEWCONF_TAG_URL,
      ga_id: process.env.GA_ID
    }
  },

  compatibilityDate: "2024-08-02"
})