import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore (secrets) {
  return new Vuex.Store({
    state: {
      accessToken: null,
      user: null
    },

    actions: {},

    mutations: {
      setUser (state, user) {
        state.user = user
      },
      setAccessToken (state, accessToken) {
        state.accessToken = accessToken
      }
    },

    getters: {}
  })
}