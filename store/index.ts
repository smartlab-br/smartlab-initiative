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
    currentDimIdStr: null as unknown as string,
    aboutSmartlabData: null as any,
    localidadeData: null as any,
    localidadeIdStr: null as unknown as string
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
      this.currentDimIdStr = this.currentDimData.id
    },
    async setLocalidade(idLocalidade: string) {
      let url = null
      this.localidadeIdStr = idLocalidade
      if (idLocalidade == "0") { // Brasil
        this.localidadeData = {
          id_localidade: 0,
          nm_localidade: "Brasil",
          tipo: "",
          img: "/thumbs/municipios/" + idLocalidade + ".jpg"
        }
      } else if (idLocalidade.length == 2) { // Estado
        url = "/municipios?categorias=cd_uf,nm_uf&agregacao=distinct&filtros=eq-cd_uf-" + idLocalidade
        await $fetch(UrlTransformService.getApiUrl(url))
          .then((result: any) => {
            this.localidadeData = result.data.dataset[0]
            this.localidadeData.id_localidade = this.localidadeData.cd_uf
            this.localidadeData.nm_localidade = this.localidadeData.nm_uf
            this.localidadeData.tipo = "UF"
            this.localidadeData.img = "/thumbs/municipios/" + idLocalidade + ".jpg"
          }, (error) => {
            console.error(error.toString())
            // this.sendError("Falha ao buscar dados do município")
          })
      } else {
        url = "/municipio/" + idLocalidade
        await $fetch(UrlTransformService.getApiUrl(url))
          .then((result: any) => {
            this.localidadeData = result.data[0]
            this.localidadeData.id_localidade = this.localidadeData.cd_municipio_ibge_dv
            this.localidadeData.nm_localidade = this.localidadeData.nm_municipio_uf
            this.localidadeData.tipo = "Município"
            this.localidadeData.img = "/thumbs/municipios/" + idLocalidade + ".jpg"
          }, (error) => {
            console.error(error.toString())
            // this.sendError("Falha ao buscar dados do município")
          })
      }
      // this[nm_var] = localidade
      // this.customParams[nm_var] = localidade
      // this.$analysisUnitModel.setPlace(nm_var, localidade)
    },
  },
  getters: {
    smartlab: state => state.smartlabData,
    observatories: state => state.observatoriesData,
    currentObs: state => state.currentObsData,
    currentObsId: state => state.currentObsIdStr,
    currentDimension: state => state.currentDimData,
    currentDimensionId: state => state.currentDimIdStr,
    aboutSmartlab: state => state.aboutSmartlabData,
    localidade: state => state.localidadeData,
    localidadeId: state => state.localidadeIdStr
  },

})