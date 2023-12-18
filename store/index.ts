import { defineStore } from "pinia"
import { Smartlab } from "~/utils"

export const useMainStore = defineStore("main", {
  state: () => ({
    smartlab: {} as any,
    observatories: {} as any,
  }),
  actions: {
    async loadSmartlabData() {
      // `this` is the store instance
      const data = await Smartlab.getData()
      this.smartlab = data
    },
  },
  getters: {
    smartlab: state => state.smartlab,
    observatories: state => state.smartlab.observatorios.filter((obs: any) => !obs.external),
  },

})