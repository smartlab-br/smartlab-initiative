import Vue from 'vue'
import VueGtag from 'vue-gtag'

export default function ({ $config, app }) {
  Vue.use(VueGtag, {
    appName: 'Smartlab',
    config: { id: $config.ga_id },
    pageTrackerScreenviewEnabled: true,
    pageTrackerTemplate: (to, from) => {
      return {
        page_title: to.name,
        page_path: to.fullPath
      }
    }
  }, app.router)
}
