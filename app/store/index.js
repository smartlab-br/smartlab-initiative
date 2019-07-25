import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore (secrets) {
  return new Vuex.Store({
    state: {},

    actions: {},

    mutations: {},

    getters: {}
  })
}