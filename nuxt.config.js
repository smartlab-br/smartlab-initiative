// import colors from 'vuetify/es5/util/colors'
import VuetifyLoaderPlugin from "vuetify-loader/lib/plugin";

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - smartlab',
    title: 'Plataforma SmartLab de Trabalho Decente',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Iniciativa SmartLab de Trabalho Decente Políticas Públicas de Trabalho Decente Guiadas por Dados' },
      { name: 'format-detection', content: 'telephone=no' },
      { name:"theme-color", content:"#E0E0E0"},
      { property:"og:title", content:"Plataforma SmartLab de Trabalho Decente" },
      { property:"og:url", content:"https://smartlabbr.org" },
      { property:"og:image", content:"https://smartlabbr.org/static/icons/smartlab.png" }
  

    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/icons/smartlab.png' },
      { href:'https://fonts.googleapis.com/css?family=Material+Icons', rel:"stylesheet", type:"text/css"}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/app.styl',
    'leaflet/dist/leaflet.css'    
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/mixins/service/snackbarManager.js'},
    { src: '~/plugins/mixins/service/viewConfReader.js'},
    { src: '~/plugins/services.plugin.js'},
    { src: '~/plugins/models.plugin.js'},
    { src: '~/plugins/vue-cookies.js'},
    { src: '~/plugins/vuetify.js'}
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    dirs: [
      '~/components',
      '~/components/card',
      '~/components/card/content',
      '~/components/card/story',
      '~/components/chart',
      '~/components/emitter',
      '~/components/text',
      '~/components/viz'
    ]    
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/fontawesome',
    '@nuxtjs/router',
    '@nuxtjs/google-analytics'
  ],

  fontawesome:{
    icons:{
      brands: ['faInstagram', 'faGithub', 'faDocker', 'faCreativeCommons', 'faOsi']
    }
  },
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },

  serverMiddleware: [
    '~/server-middleware/api.js' 
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vuetify'],
    plugins: [new VuetifyLoaderPlugin()],
    extend(config, ctx) {}    
  },

  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID,
    debug: {
      enabled: true,
      sendHitTask: true
    }
  }

}
