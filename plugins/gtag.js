import Vue from 'vue'
import VueGtag from 'vue-gtag'
export default function ({ $config, app }) {
  Vue.use(VueGtag, {
    appName: 'Smartlab',
    config: { id: $config.ga_id },
    pageTrackerScreenviewEnabled: true
  }, app.router)
}
