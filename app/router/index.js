import Vue from 'vue'
import Router from 'vue-router'

// The meta data for your routes
const meta = require('./meta.json')

// Function to create routes
// Is default lazy but can be changed
function route (path, view) {
  return {
    path: path,
    meta: meta[path],
    component: resolve => import(`pages/${view}View.vue`).then(resolve)
  }
}

Vue.use(Router)

export function createRouter () {
    const router = new Router({
      base: __dirname,
      mode: 'history',
      scrollBehavior: () => ({ y: 0 }),
      routes: [
        // Definitivas
        route('/', 'Welcome'),
        route('/saibamais', 'sobre/SaibaMais'),
        route('/saibamais/:tab', 'sobre/SaibaMais'),
        route('/fontes', 'sobre/Fontes'),
        route('/fontes/:tab', 'sobre/Fontes'),
        route('/estudo/:idEstudo', 'Estudo'),

        // Rotas antigas
        // route('/localidade/:idLocalidade', 'Localidade'),
        // route('/observatorio/:idObservatorio', 'Observatorio'),
        // route('/embreve/:idObservatorio', 'ObservatorioEmBreve'),
        // route('/observatoriomapa/:idObservatorio', 'ObservatorioMapa'),
        
        // Rotas novas para melhor identidade dos observatórios

        route('/trabalhodecente', 'Observatorio'),
        route('/diversidade', 'Observatorio'),
        route('/sst', 'Observatorio'),
        route('/trabalhoescravo', 'Observatorio'),
        route('/trabalhoinfantil', 'Observatorio'),
        route('/covid', 'Observatorio'),
        
        route('/trabalhodecente/localidade/:idLocalidade', 'Localidade'),
        route('/diversidade/localidade/:idLocalidade', 'Localidade'),
        route('/sst/localidade/:idLocalidade', 'Localidade'),
        route('/trabalhoescravo/localidade/:idLocalidade', 'Localidade'),
        route('/trabalhoinfantil/localidade/:idLocalidade', 'Localidade'),
        route('/covid/localidade/:idLocalidade', 'Localidade'),

        route('/trabalhodecente/localidadecompare/:idLocalidade', 'LocalidadeCompare'),
        route('/diversidade/localidadecompare/:idLocalidade', 'LocalidadeCompare'),
        route('/sst/localidadecompare/:idLocalidade', 'LocalidadeCompare'),
        route('/trabalhoescravo/localidadecompare/:idLocalidade', 'LocalidadeCompare'),
        route('/trabalhoinfantil/localidadecompare/:idLocalidade', 'LocalidadeCompare'),
        route('/covid/localidadecompare/:idLocalidade', 'LocalidadeCompare'),

        route('/trabalhodecente/smartmap', 'ObservatorioMapa'),
        route('/diversidade/smartmap', 'ObservatorioMapa'),
        route('/sst/smartmap', 'ObservatorioMapa'),
        route('/trabalhoescravo/smartmap', 'ObservatorioMapa'),
        route('/trabalhoinfantil/smartmap', 'ObservatorioMapa'),
        route('/covid/smartmap', 'ObservatorioMapa'),

        route('/trabalhodecente/embreve', 'ObservatorioEmBreve'),
        route('/diversidade/embreve', 'ObservatorioEmBreve'),
        route('/sst/embreve', 'ObservatorioEmBreve'),
        route('/trabalhoescravo/embreve', 'ObservatorioEmBreve'),
        route('/trabalhoinfantil/embreve', 'ObservatorioEmBreve'),
        route('/covid/embreve', 'ObservatorioEmBreve'),

        route('/perfil', 'Perfil'),

        // Provisórias
        route('/mapa/:nmIndicador', 'Mapa'),
        // Global redirect for 404
        { path: '*', redirect: '/' }
      ]
    })

    // Send a pageview to Google Analytics
    router.beforeEach((to, from, next) => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', to.path)
            ga('send', 'pageview')
        }

        next()
    })

    return router
}
