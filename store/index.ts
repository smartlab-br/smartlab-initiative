import { defineStore } from "pinia"
import type { RouteLocationNormalizedLoaded } from "vue-router"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"

export const useMainStore = defineStore("main", {
  state: () => ({
    smartlabData: null as any,
    observatoriesData: null as any,
    currentObsData: null as any,
    currentObsIdStr: null as unknown as string,
    currentDimData: null as any,
    aboutSmartlabData: null as any
  }),
  actions: {
    async loadSmartlabData() {
      const data = await YamlFetcherService.loadYaml("br/observatorios")
      this.smartlabData = data
      this.observatoriesData = data.observatorios.filter((obs: any) => !obs.external)
      for (const obs of this.observatoriesData) {
        const dims = await YamlFetcherService.loadYaml("br/dimensao/"+obs.id)
        obs.dimensions = dims.dimensoes
      }
      const aboutData = await YamlFetcherService.loadYaml("br/about")
      this.aboutSmartlabData = aboutData
    },
    setCurrentObs (route: RouteLocationNormalizedLoaded) {
      this.currentObsData = this.observatoriesData.find((obs: any) => route.fullPath.includes(obs.to))
      if (this.currentObsData !== undefined) {
        this.currentObsIdStr = this.currentObsData.id
      }
      else { //"trabalhodecente" default
        this.currentObsIdStr = "td"
        this.currentObsData = this.observatoriesData.find((obs: any) => obs.id == this.currentObsId)
      }
      this.setCurrentDimension(route.query.dimensao ? route.query.dimensao.toString() : "")
    },
    setCurrentDimension(id: string = "") {
      if (id != "") {
        this.currentDimData = this.currentObsData.dimensions.find((dim: any) => dim.id == id)
      } else {
        this.currentDimData = this.currentObsData.dimensions.find((dim: any) => dim.default)
      }
    }
  },
  getters: {
    smartlab: state => state.smartlabData,
    observatories: state => state.observatoriesData,
    currentObs: state => state.currentObsData,
    currentObsId: state => state.currentObsIdStr,
    currentDimension: state => state.currentDimData,
    aboutSmartlab: state => state.aboutSmartlabData
  },

})