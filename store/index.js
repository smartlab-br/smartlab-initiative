export const state = () => ({
  accessToken: null,
  user: null
})

export const getters = {
}

export const mutations = {
  setUser (state, user) {
    state.user = user
  },
  setAccessToken (state, accessToken) {
    state.accessToken = accessToken
  }
}

export const actions = {
}
