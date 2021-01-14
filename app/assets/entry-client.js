import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './app'

import VueWorker from 'vue-worker'
Vue.use(VueWorker)

const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}


let nuLnkPreConn = document.createElement('link');
nuLnkPreConn.name = "datahub_lnk";
nuLnkPreConn.rel = "preconnect";
nuLnkPreConn.href = store.state.DATAHUB_API_BASE_URL;
document.head.appendChild(nuLnkPreConn);

// Distribute store state
app.$about.setStore(app.$store.state);
app.$analysisUnitModel.setStore(app.$store.state);
app.$dimensions.setStore(app.$store.state);
app.$indicatorsModel.setStore(app.$store.state);
app.$observatories.setStore(app.$store.state);
app.$axiosCallSetupService.setStore(app.$store.state);
app.$yamlFetcherService.setStore(app.$store.state);

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
  // Add router hook for handling asyncData.
  // Doing it after initial route is resolved so that we don't double-fetch
  // the data that we already have. Using router.beforeResolve() so that all
  // async components are resolved.
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })
    if (!activated.length) {
      return next()
    }
    Promise.all(activated.map(c => {
      if (c.asyncData) {
        return c.asyncData({ store, route: to })
      }
    })).then(() => {
      next()
    }).catch(next)
  })

  // actually mount to DOM
  app.$mount('#app')
})
