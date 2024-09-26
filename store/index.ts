import { defineStore } from "pinia"
import type { RouteLocationNormalizedLoaded } from "vue-router"
import { YamlFetcherService } from "~/utils/service/singleton/yamlFetcher"
import { useSnackbarStore } from "./snackbar"

export const useMainStore = defineStore("main", {
  
  state: () => ({
    smartlabData: null as Smartlab | null,
    observatoriesData: null as Observatory[] | null,
    currentObsData: null as Observatory | null,
    currentObsIdStr: null as string | null,
    currentDimData: null as Dimension | null,
    currentDimIdStr: null as string | null,
    aboutSmartlabData: null as About | null,
    currentAnalysisUnitData: null as any | null,
    currentAnalysisUnitIdStr: null as string | null,
    placesData: null as Place[] | null
  }),
  actions: {
    async loadSmartlabData() {
      const snackbar = useSnackbarStore()
      try {
        const data = await YamlFetcherService.loadYaml("br/observatorios")
        this.smartlabData = data
        this.observatoriesData = data.observatories.filter((obs: any) => !obs.external)
        if (this.observatoriesData){
          for (const obs of this.observatoriesData) {
            const dims = await YamlFetcherService.loadYaml("br/dimensao/"+obs.id)
            obs.dimensions = dims.dimensoes
            const obsPage: ObsPage = await YamlFetcherService.loadYaml("br/observatorio/"+obs.id)
            obs.obsPage = obsPage
          }
        }
        const aboutData = await YamlFetcherService.loadYaml("br/about")
        this.aboutSmartlabData = aboutData  
      } catch (error) {
        snackbar.showSnackbar({ color: "error", text: "Erro ao carregar estrutura do Smartlab." })    
      }        
    },
    setCurrentObs (route: RouteLocationNormalizedLoaded) {
      this.currentObsData = this.observatoriesData?.find((obs: Observatory) => route.fullPath.includes(obs.to)) ?? null
      if (this.currentObsData !== null) {
        this.currentObsIdStr = this.currentObsData?.id ?? ""
        this.setCurrentDimension(route.query.dimensao ? route.query.dimensao.toString() : "")
      }
      else { 
        this.currentObsIdStr = "default"
        if (route.fullPath.includes("perfil")) { // Perfil
          this.currentObsData = {
            id: "perfil",
            blocked: false,
            title: "Perfil",
            short_title: "Perfil",
            short_desc: "Perfil",
            tooltip: "Perfil",
            hash_tag: "",
            to: "",
            external: false,
            app_icon: "",
            rippleColor: "",
            dimensions: []
          }
        } else if (route.fullPath.includes("mapasite")) { // Mapa do Site
          this.currentObsData = {
            id: "mapasite",
            blocked: false,
            short_title: "Mapa do Site",
            title: "Mapa do Site",
            short_desc: "Mapa do Site",
            tooltip: "Mapa do Site",
            hash_tag: "",
            to: "",
            external: false,
            app_icon: "",
            rippleColor: "",
            dimensions: []
          }
        } else if (route.fullPath.includes("saibamais")) { // Sobre
          this.currentObsData = {
            id: "saibamais",
            blocked: false,
            short_title: "Sobre",
            title: "Sobre",
            short_desc: "Sobre",
            tooltip: "Sobre",
            hash_tag: "",
            to: "",
            external: false,
            app_icon: "",
            rippleColor: "",
            dimensions: []
          }
        } else {  //Home
          this.currentObsData = {
            id: "home",
            blocked: false,
            short_title: "",
            title: "",
            short_desc: "",
            tooltip: "",
            hash_tag: "",
            to: "",
            external: false,
            app_icon: "",
            rippleColor: "",
            dimensions: []
          }
        }
      }
    },
    setCurrentDimension(id: string = "") {
      if (id != "") {
        this.currentDimData = this.currentObsData?.dimensions.find((dim: any) => dim.id == id) ?? null
      } else {
        this.currentDimData = this.currentObsData?.dimensions.find((dim: any) => dim.default) ?? null
      }
      this.currentDimIdStr = this.currentDimData?.id ?? ""
    },
    async setCurrentAnalysisUnit(idAnalysisUnit: string) {
      const snackbar = useSnackbarStore()
      try {
        let url = null
        this.currentAnalysisUnitIdStr = idAnalysisUnit
        if (idAnalysisUnit == "0") { // Brasil
          this.currentAnalysisUnitData = {
            id_localidade: 0,
            nm_localidade: "Brasil",
            tipo: "",
            img: "/thumbs/municipios/" + idAnalysisUnit + ".jpg"
          }
        } else if (idAnalysisUnit.length == 2) { // Estado
          url = "/municipios?categorias=cd_uf,nm_uf&agregacao=distinct&filtros=eq-cd_uf-" + idAnalysisUnit
          await $fetch(UrlTransformService.getApiUrl(url))
            .then((result: any) => {
              this.currentAnalysisUnitData = result.data.dataset[0]
              this.currentAnalysisUnitData.id_localidade = this.currentAnalysisUnitData.cd_uf
              this.currentAnalysisUnitData.nm_localidade = this.currentAnalysisUnitData.nm_uf
              this.currentAnalysisUnitData.tipo = "UF"
              this.currentAnalysisUnitData.img = "/thumbs/municipios/" + idAnalysisUnit + ".jpg"
            }, (error) => {
              console.error(error.toString())
              // this.sendError("Falha ao buscar dados do município")
            })
        } else {
          url = "/municipio/" + idAnalysisUnit
          await $fetch(UrlTransformService.getApiUrl(url))
            .then((result: any) => {
              this.currentAnalysisUnitData = result.data[0]
              this.currentAnalysisUnitData.id_localidade = this.currentAnalysisUnitData.cd_municipio_ibge_dv
              this.currentAnalysisUnitData.nm_localidade = this.currentAnalysisUnitData.nm_municipio_uf
              this.currentAnalysisUnitData.tipo = "Município"
              this.currentAnalysisUnitData.img = "/thumbs/municipios/" + idAnalysisUnit + ".jpg"
            }, (error) => {
              console.error(error.toString())
              // this.sendError("Falha ao buscar dados do município")
            })
        }
        // this[nm_var] = localidade
        // this.customParams[nm_var] = localidade
        // this.$analysisUnitModel.setPlace(nm_var, localidade)
      } catch (error) {
        snackbar.showSnackbar({ color: "error", text: "Erro ao carregar dados da Unidade de Análise escolhida (Brasil, município ou UF)" })    
      }
    },
    async getPlaces() {
      const snackbar = useSnackbarStore()
      const options: Place[] = []
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

      try {
        const result: any = await $fetch(UrlTransformService.getApiUrl(url))
        const municipios = result.dataset
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
            type: "place",
            exclude_from: []
          })
        }
        this.placesData = options
      } catch (error) {
        this.placesData = options // Você pode manter os dados padrão ou realizar outra ação
        snackbar.showSnackbar({ color: "error", text: "Erro ao carregar unidades de análises (municípios e UFs)" })    
      }        
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
    currentAnalysisUnit: state => state.currentAnalysisUnitData,
    currentAnalysisUnitId: state => state.currentAnalysisUnitIdStr,
    places:  state => state.placesData
  },

})

export type MainStore = ReturnType<typeof useMainStore>