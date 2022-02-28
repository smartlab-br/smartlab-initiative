import axios from 'axios'

import { ObservatoryService } from "plugins/service/observatory"
import { NavigationService } from "plugins/service/navigation"

class AnalysisUnit {
  id: number | string
  label: string
  scope: string
  detail: string
  icon: string
  to: string
  type: string
  exclude_from: string[]
  uf: number | string

  constructor(data: any) {
    this.id = data.id
    this.label = data.label
    this.scope = data.scope
    this.detail = data.detail
    this.icon = data.icon
    this.to = data.to
    this.type = data.type
    this.exclude_from = data.exclude_from
    this.uf = data.uf
  }

  placePRTPTM = [
    { id: 'PRT120500000', uf: 29, label: "PRT 5a Região - Sede" }
  ]
  loadStatus = {
    places: null
  }
  
  static buildAllSearchOptions(scope: any = null) {
    //this.buildMPTOptions(scope);
    return [ // Promises
      this.buildPlacesOptions(scope)
    ];
  }

  static async buildPlacesOptions(scope: any = null) {
    let options: AnalysisUnit[] = []
    if (scope == null || scope.includes('Brasil')) {
      options.push(new AnalysisUnit({
        id: 0,
        label: "Brasil",
        scope: 'br',
        detail: "País",
        icon: "location_on",
        to: "/localidade/0?",
        type: "place",
        exclude_from: ["td"],
        img: "/static/thumbs/municipios/0.jpg"
      }));
    }

    const places: any = await axios.get("/api/datahub?endpoint=municipios&categorias=cd_municipio_ibge_dv,nm_municipio_uf,cd_uf,nm_uf,cd_mesorregiao,nm_mesorregiao,cd_microrregiao,nm_microrregiao&ordenacao=cd_municipio_ibge_dv")
      
    //let cd_regiao = 0;
    //let added_meso = [];
    //let added_micro = [];
    let cd_uf = 0;
    let addedUF: number[] = []
    for (const mun of places.dataset) {
      // if (scope == null || scope.includes('Região')) {
      //   let nm_regiao = this.getRegion(mun.cd_municipio_ibge_dv.toString().substring(0, 1));

      //   // Inclui a região no select
      //   if (cd_regiao != parseInt(mun.cd_municipio_ibge_dv.toString().substring(0, 1))) {
      //     cd_regiao = parseInt(mun.cd_municipio_ibge_dv.toString().substring(0, 1));
      //     this.options.push({
      //       id: cd_regiao,
      //       label: nm_regiao,
      //       scope: 'reg',
      //       to: "/localidade/" + cd_regiao + "?",
      //       detail: "Região",
      //       icon: "location_on",
      //       type: "place"
      //       img: "/static/thumbs/municipios/" + cd_regiao + ".jpg";
      //     });
      //   }
      // }
      const cd_uf: number = parseInt(mun.cd_municipio_ibge_dv.toString().substring(0, 2))
      if ((!scope || scope.includes('Estado')) && !addedUF.includes(cd_uf)) {
        // Inclui a UF no select
        options.push(new AnalysisUnit({
          id: cd_uf,
          label: mun.nm_uf,
          scope: 'uf',
          to: "/localidade/" + cd_uf + "?",
          detail: "Unidade Federativa",
          icon: "location_on",
          type: "place",
          class: "uf",
          exclude_from: ["td"],
          img: `/static/thumbs/municipios/${cd_uf}.jpg`
        }))
        addedUF.push(cd_uf)
      }

      // Inclui a mesorregião no select
      // if (!added_meso.includes(mun.cd_mesorregiao)) {
      //   added_meso.push(mun.cd_mesorregiao);
      //   this.options.push({
      //     id: mun.cd_mesorregiao,
      //     label: mun.nm_mesorregiao,
      //     to: "/localidade/" + mun.cd_mesorregiao + "?",
      //     detail: "Mesorregião",
      //     icon: "location_on",
      //     type: "place",
      //     img: "/static/thumbs/municipios/" + mun.cd_mesorregiao + ".jpg";
      //   });
      // }

      // Inclui a microrregião no select
      // if (!added_meso.includes(mun.cd_microrregiao)) {
      //   added_micro.push(mun.cd_microrregiao);
      //   this.options.push({
      //     id: mun.cd_microrregiao,
      //     label: mun.nm_microrregiao,
      //     to: "/localidade/" + mun.cd_microrregiao + "?",
      //     detail: "Microrregião",
      //     icon: "location_on",
      //     type: "place",
      //     img: "/static/thumbs/municipios/" + mun.cd_microrregiao + ".jpg";
      //   });
      // }

      if (!scope || scope.includes('Município')) {
        // Inclui o município no select
        options.push(new AnalysisUnit({
          id: mun.cd_municipio_ibge_dv,
          uf: cd_uf,
          label: mun.nm_municipio_uf,
          scope: 'mun',
          to: "/localidade/" + mun.cd_municipio_ibge_dv + "?",
          detail: "Município",
          icon: "location_on",
          type: "place",
          img: `/static/thumbs/municipios/${mun.cd_municipio_ibge_dv}.jpg`
        }))
      }
    }

    return options
  }

  static async buildMPTOptions(scope: any = null) {
    let options: AnalysisUnit[] = []
    if (!scope || scope.includes('MPT')) {
      const response: any = await axios.get("/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct")
      
      for (const unidade of response.dataset) {
        options.push(new AnalysisUnit({
          id: unidade.cd_unidade,
          uf: unidade.cd_uf,
          label: unidade.nm_unidade,
          scope: 'unidade',
          detail: "Unidade MPT",
          icon: "business",
          to: "/localidade/" + unidade.cd_unidade + "?",
          type: "mpt"
        }))
      }
    }
    return options
  }

  static getRegion(idRegiao: string) {
    let regiao: string = "Região não identificada";
    switch (idRegiao) {
      case '1':
        regiao = "Região Norte"
        break;
      case '2':
        regiao = "Região Nordeste"
        break;
      case '3':
        regiao = "Região Sudeste"
        break;
      case '4':
        regiao = "Região Sul"
        break;
      case '5':
        regiao = "Região Centro-Oeste"
        break;
    }
    return regiao;
  }

  static getStateFromId(idLoc: string) {
    return idLoc.substring(0,2);
  }

  static searchAnalysisUnit(router: any, searchItem: any, idObservatorio: any = null, observatorios: any = null) {
    let route = router.currentRoute;

    if (searchItem === null || searchItem === undefined) {
      throw "Nenhum item selecionado";
    }

    let obsAtual = ObservatoryService.identifyObservatory(route.path.split('/')[1]);
    
    let url = '';
    if (idObservatorio != null) {
      url = "/" + ObservatoryService.identifyObservatoryById(idObservatorio) + searchItem.to;  
      if(obsAtual && idObservatorio == obsAtual){
        if (route.query && route.query.dimensao) {
          url = url + '&dimensao=' + route.query.dimensao;
        }
      }
    } else if(obsAtual){
      if(searchItem.exclude_from && searchItem.exclude_from.includes(obsAtual)){
        throw "A análise da localidade escolhida ("+ searchItem.detail +") não está disponível para esse observatório.";
      }

      url = "/" + ObservatoryService.identifyObservatoryById(obsAtual) + searchItem.to;  

      if (route.query && route.query.dimensao) {
        url = url + '&dimensao=' + route.query.dimensao;
      }
    } else {
      for (let obs of observatorios){
        if(searchItem.exclude_from && searchItem.exclude_from.includes(obs.id)){
          continue;
        } else {
          url = obs.to + searchItem.to;
          break;
        }
      }
    }
    
    NavigationService.pushRoute(router, url);
  }

}

export { AnalysisUnit }
