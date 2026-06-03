import { defineStore } from "pinia"

interface AuthState {
  user: Record<string, any> | null;
  accessToken: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
  }),
  actions: {
    setUser(user: Record<string, any> | null) {
      this.user = user
    },
    setAccessToken(accessToken: string | null) {
      this.accessToken = accessToken
    },
  },
})
