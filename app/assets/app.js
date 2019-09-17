import Vue from 'vue'
import Vuetify from 'vuetify'
import VueCookies from 'vue-cookies'
import VueAnalytics from 'vue-analytics'
import 'vuetify/dist/vuetify.css'
import App from './App.vue'
import Components from 'components/_index'
import colors from 'vuetify/es5/util/colors'

import { createStore } from 'store/index'
import { createRouter } from 'router/index'
import { sync } from 'vuex-router-sync'

import fontawesome from '@fortawesome/fontawesome'
// import solid from '@fortawesome/fontawesome-free-solid'
import brands from '@fortawesome/fontawesome-free-brands'

fontawesome.library.add(brands, brands.faGithub)
fontawesome.library.add(brands, brands.faDocker)
fontawesome.library.add(brands, brands.faLinkedinIn)
fontawesome.library.add(brands, brands.faFacebookF)
fontawesome.library.add(brands, brands.faTwitter)

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },    
  theme: {
    primary: colors.grey.darken4,
    secondary: colors.amber.accent4,
    accent: colors.amber.accent4,
    error: colors.red.base,
    warning: colors.amber.base,
    info: colors.blue.base,
    success: colors.green.base,
    toolbar: colors.grey.darken4
  }
});

Vue.use(VueCookies)

///////////////////////////////
// Habilitando plugins in-house
// 1. Models (singletons)
import ObservatoriesModel from './model/singleton/observatoriesModel'
Vue.prototype.$observatories = new ObservatoriesModel();
import AboutModel from './model/singleton/aboutModel'
Vue.prototype.$about = new AboutModel();
import DimensionsModel from './model/singleton/dimensionsModel'
Vue.prototype.$dimensions = new DimensionsModel();
import TranslationModel from './model/singleton/translationModel'
Vue.prototype.$translationModel = new TranslationModel();
import AnalysisUnitModel from './model/singleton/analysisUnitModel'
Vue.prototype.$analysisUnitModel = new AnalysisUnitModel();
import IndicatorsModel from './model/singleton/indicatorsModel'
Vue.prototype.$indicatorsModel = new IndicatorsModel();

// 2. Services
// 2.1. Singletons
import AxiosCallSetupService from './service/singleton/axiosCallSetupService.js'
Vue.prototype.$axiosCallSetupService = new AxiosCallSetupService();
import DateFormatService from './service/singleton/dateFormatService.js'
Vue.prototype.$dateFormatService = new DateFormatService();
import NumberTransformService from './service/singleton/numberTransformService.js'
Vue.prototype.$numberTransformService = new NumberTransformService();
import ObjectTransformService from './service/singleton/objectTransformService.js'
Vue.prototype.$objectTransformService = new ObjectTransformService();
import TextTransformService from './service/singleton/textTransformService.js'
Vue.prototype.$textTransformService = new TextTransformService();
import ColorsService from './service/singleton/colorsService'
Vue.prototype.$colorsService = new ColorsService();
import TooltipBuildingService from './service/singleton/tooltipBuildingService'
Vue.prototype.$tooltipBuildingService = new TooltipBuildingService();
import YamlFetcherService from './service/singleton/yamlFetcherService'
Vue.prototype.$yamlFetcherService = new YamlFetcherService();

// import ChartBuilderService from './service/chart/chartBuilderService'
// Vue.prototype.$chartBuilderService = new ChartBuilderService();

// 2.2. Global Mixins
import GeoIpClient from '../mixins/service/geoIpClient.js'
Vue.use(GeoIpClient)
import NavigationManager from '../mixins/service/navigationManager.js'
Vue.use(NavigationManager)
import SnackbarManager from '../mixins/service/snackbarManager.js'
Vue.use(SnackbarManager)
import ViewConfReader from '../mixins/service/viewConfReader.js'
Vue.use(ViewConfReader)
///////////////////////////////

Object.keys(Components).forEach(key => {
  Vue.component(key, Components[key])
})

// Expose a factory function that creates a fresh set of store, router,
// app instances on each call (which is called for each SSR request)
export function createApp (ssrContext, secrets) {
  // create store and router instances
  const store = createStore(secrets)
  const router = createRouter()

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)
  
  const ga_id = process.env.GA_ID_BASE + process.env.GA_ID_DV;
  //console.log(ga_id)
  if (ga_id) {
    Vue.use(VueAnalytics, { id: ga_id })
  }

  // create the app instance.
  // here we inject the router, store and ssr context to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = new Vue({
    router,
    store,
    ssrContext,
    render: h => h(App)
  })

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return { app, router, store }
}
