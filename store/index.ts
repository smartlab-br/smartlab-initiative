import { defineStore } from "pinia"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"

export const useMainStore = defineStore("main", {
  state: () => ({
    smartlabData: null as any,
    observatoriesData: null as any,
    currentObsData: null as any,
    currentObsIdStr: null as unknown as string,
    currentDimension: null as any
  }),
  actions: {
    async loadSmartlabData() {
      const data = await YamlFetcherService.loadYaml("br/observatorios")
      this.smartlabData = data
      this.observatoriesData = data.observatorios.filter((obs: any) => !obs.external)
    },
    setCurrentObs (route: string) {
      this.currentObsData = this.observatoriesData.find((obs: any) => {route.includes(obs.to)})
      if (this.currentObsData !== undefined) {
        this.currentObsIdStr = this.currentObsData.id
      }
      else { //"trabalhodecente" default
        this.currentObsIdStr = "td"
        this.currentObsData = this.observatoriesData.find((obs: any) => {obs.id == this.currentObsId})
      }
    }
  },
  getters: {
    smartlab: state => state.smartlabData,
    observatories: state => state.observatoriesData,
    currentObs: state => state.currentObsData,
    currentObsId: state => state.currentObsIdStr,
  },

})