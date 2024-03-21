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
    localidadeIdStr: null as unknown as string,
    placesData: null as any
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
      else { //default
        this.currentObsIdStr = "default"
        if (route.fullPath.includes("perfil")) { // Perfil
          this.currentObsData = {
            short_title: "Perfil",
            title: "Perfil"
          }
        } else if (route.fullPath.includes("mapasite")) { // Mapa do Site
          this.currentObsData = {
            short_title: "Mapa do Site",
            title: "Mapa do Site"
          }
        } else if (route.fullPath.includes("saibamais")) { // Sobre
          this.currentObsData = {
            short_title: "Sobre",
            title: "Sobre"
          }
        } else {
          this.currentObsData = {
            short_title: "",
            title: ""
          }
        }
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
    async getPlaces() {
      const options: any[] = []
      options.push({
        id: 0,
        label: "Brasil",
        scope: "br",
        detail: "País",
        icon: "location_on",
        to: "/localidade/0?",
        type: "place",
        exclude_from: ["td"]
      })
  
      const url = "/municipios?categorias=cd_municipio_ibge_dv,nm_municipio_uf,cd_uf,nm_uf,cd_mesorregiao,nm_mesorregiao,cd_microrregiao,nm_microrregiao&ordenacao=cd_municipio_ibge_dv"
      const result: any = await $fetch(UrlTransformService.getApiUrl(url)).catch((error) => {
        Promise.reject(error)
      })
      const municipios = result.data.dataset
      // let cd_regiao = 0;
      // let added_meso = [];
      // let added_micro = [];
      let cd_uf = 0
      for (const indxMunicipio in municipios) {
        // if (scope == null || scope.includes("Região")) {
        //   let nm_regiao = this.getRegion(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1));
  
        //   // Inclui a região no select
        //   if (cd_regiao != parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1))) {
        //     cd_regiao = parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1));
        //     this.options.push({
        //       id: cd_regiao,
        //       label: nm_regiao,
        //       scope: "reg",
        //       to: "/localidade/" + cd_regiao + "?",
        //       detail: "Região",
        //       icon: "location_on",
        //       type: "place"
        //     });
        //   }
        // }
  
        // Inclui a UF no select
        if (cd_uf != parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 2))) {
          cd_uf = municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 2)
          options.push({
            id: cd_uf,
            label: municipios[indxMunicipio].nm_uf,
            scope: "uf",
            to: "/localidade/" + cd_uf + "?",
            detail: "Unidade Federativa",
            icon: "location_on",
            type: "place",
            exclude_from: ["td"]
          })
        }
  
        // Inclui a mesorregião no select
        // if (!added_meso.includes(municipios[indxMunicipio].cd_mesorregiao)) {
        //   added_meso.push(municipios[indxMunicipio].cd_mesorregiao);
        //   this.options.push({
        //     id: municipios[indxMunicipio].cd_mesorregiao,
        //     label: municipios[indxMunicipio].nm_mesorregiao,
        //     to: "/localidade/" + municipios[indxMunicipio].cd_mesorregiao + "?",
        //     detail: "Mesorregião",
        //     icon: "location_on",
        //     type: "place"
        //   });
        // }
  
        // Inclui a microrregião no select
        // if (!added_meso.includes(municipios[indxMunicipio].cd_microrregiao)) {
        //   added_micro.push(municipios[indxMunicipio].cd_microrregiao);
        //   this.options.push({
        //     id: municipios[indxMunicipio].cd_microrregiao,
        //     label: municipios[indxMunicipio].nm_microrregiao,
        //     to: "/localidade/" + municipios[indxMunicipio].cd_microrregiao + "?",
        //     detail: "Microrregião",
        //     icon: "location_on",
        //     type: "place"
        //   });
        // }
  
        // Inclui o município no select
        options.push({
          id: municipios[indxMunicipio].cd_municipio_ibge_dv,
          label: municipios[indxMunicipio].nm_municipio_uf,
          scope: "mun",
          to: "/localidade/" + municipios[indxMunicipio].cd_municipio_ibge_dv + "?",
          detail: "Município",
          icon: "location_on",
          type: "place"
        })
      }
      this.placesData = options
    }
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
    localidadeId: state => state.localidadeIdStr,
    places:  state => state.placesData
  },

})