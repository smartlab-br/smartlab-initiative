import Vue from 'vue'
import Router from 'vue-router'

import Welcome from '~/pages/WelcomeView.vue'
import LocalidadeCompare from '~/pages/LocalidadeCompareView.vue'
import Localidade from '~/pages/LocalidadeView.vue'
import MapaSite from '~/pages/MapaSiteView.vue'
import Observatorio from '~/pages/ObservatorioView.vue'
import ObservatorioMapa from '~/pages/ObservatorioMapaView.vue'
import ObservatorioEmBreve from '~/pages/ObservatorioEmBreveView.vue'
import Estudo from '~/pages/EstudoView.vue'
import Fontes from '~/pages/sobre/FontesView.vue'
import SaibaMais from '~/pages/sobre/SaibaMaisView.vue'

// const WelcomePage = () => import('~/pages/WelcomeView.vue')

// The meta data for your routes
const meta = require('~/router/meta.json')

// Function to create routes
// // Is default lazy but can be changed
function route (path, component) {
  return {
    path,
    meta: meta[path],
    component
  }
}

Vue.use(Router)

export function createRouter () {
  const router = new Router({
    // base: __dirname,
    mode: 'history',
    // scrollBehavior: () => ({ y: 0 }),
    routes: [
      // Definitivas
      // {
      //   path: '/',
      //   component: WelcomePage
      // },
      route('/', Welcome),
      route('/saibamais', SaibaMais),
      route('/saibamais/:tab', SaibaMais),
      route('/fontes', Fontes),
      route('/fontes/:tab', Fontes),
      route('/estudo/:idEstudo', Estudo),

      route('/trabalhodecente', Observatorio),
      route('/diversidade', Observatorio),
      route('/sst', Observatorio),
      route('/trabalhoescravo', Observatorio),
      route('/trabalhoinfantil', Observatorio),
      // route('/covid', Observatorio),

      route('/trabalhodecente/localidade/:idLocalidade', Localidade),
      route('/diversidade/localidade/:idLocalidade', Localidade),
      route('/sst/localidade/:idLocalidade', Localidade),
      route('/trabalhoescravo/localidade/:idLocalidade', Localidade),
      route('/trabalhoinfantil/localidade/:idLocalidade', Localidade),
      // route('/covid/localidade/:idLocalidade', Localidade),

      route('/trabalhodecente/localidadecompare/:idLocalidade', LocalidadeCompare),
      route('/diversidade/localidadecompare/:idLocalidade', LocalidadeCompare),
      route('/sst/localidadecompare/:idLocalidade', LocalidadeCompare),
      route('/trabalhoescravo/localidadecompare/:idLocalidade', LocalidadeCompare),
      route('/trabalhoinfantil/localidadecompare/:idLocalidade', LocalidadeCompare),
      // route('/covid/localidadecompare/:idLocalidade', LocalidadeCompare),

      route('/trabalhodecente/smartmap', ObservatorioMapa),
      route('/diversidade/smartmap', ObservatorioMapa),
      route('/sst/smartmap', ObservatorioMapa),
      route('/trabalhoescravo/smartmap', ObservatorioMapa),
      route('/trabalhoinfantil/smartmap', ObservatorioMapa),
      // route('/covid/smartmap', ObservatorioMapa),

      route('/trabalhodecente/embreve', ObservatorioEmBreve),
      route('/diversidade/embreve', ObservatorioEmBreve),
      route('/sst/embreve', ObservatorioEmBreve),
      route('/trabalhoescravo/embreve', ObservatorioEmBreve),
      route('/trabalhoinfantil/embreve', ObservatorioEmBreve),
      route('/covid/embreve', ObservatorioEmBreve),

      // route('/perfil', 'Perfil'),
      // route('/cadastro', 'Cadastro'),

      route('/mapasite', MapaSite)

      // Provisórias
      // route('/mapa/:nmIndicador', 'Mapa'),
      // Global redirect for 404
      // { path: '*', redirect: '/' }

    ]
  })

  // // Send a pageview to Google Analytics
  // router.beforeEach((to, from, next) => {
  //     if (typeof ga !== 'undefined') {
  //         ga('set', 'page', to.path)
  //         ga('send', 'pageview')
  //     }

  //     next()
  // })

  return router
}
