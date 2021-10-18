import axios from 'axios'
import VueCookies from 'vue-cookies'

import AxiosCallSetupService from '../../service/singleton/axiosCallSetupService'

class AnalysisUnitModel {
  placePRTPTM = [
    { id: 'PRT120500000', uf: 29, label: "PRT 5a Região - Sede" }
  ]
  currentAnalysisUnit = null
  options = []
  loadStatus = {
    places: null
  }
  
  constructor() {
  }

  setStore(store) {
    this.store = store;
    this.axiosSetup = new AxiosCallSetupService(store);
  }

  getCurrentAnalysisUnit() {
    if (this.currentAnalysisUnit) {
      return this.currentAnalysisUnit;
    }
    return VueCookies.get("currentAnalysisUnit");
  }

  setCurrentAnalysisUnit(idAU) {
    VueCookies.set("currentAnalysisUnit", idAU, -1); // Never expires
    this.currentAnalysisUnit = idAU;
  }

  isCurrent(idAU) {
    if (this.currentAnalysisUnit) {
      return idAU == this.currentAnalysisUnit;
    }
    return idAU == VueCookies.get("currentAnalysisUnit");
  }

  getOptions() {
    return this.options ? this.options : [];
  }

  getSearchDataset() {
    if (this.isLoaded()) return this.options; // If loaded, returns the dataset
    if (!this.hasStartedLoading()) return this.buildAllSearchOptions(); // If loading hasn't been triggered, start loading an return a promise
    // If it's loading, create a promise that waits until loading is finished to continue the execution
    return null;
  }

  hasStartedLoading() {
    for (let indx in this.loadStatus) {
      if (this.loadStatus[indx]) return true;
    }
    return false;
  }
  
  isLoaded() {
    for (let indx in this.loadStatus) {
      if (this.loadStatus[indx] !== 'SUCCESS' && this.loadStatus[indx] !== 'ERROR') return false;
    }
    return true;
  }

  getIdLocalidade(estado, municipio) {
    let url = "/municipios?categorias=cd_municipio_ibge_dv,nm_municipio_uf-nm_localidade&filtros=eq-nm_uf-\"" + estado + "\",and,eq-nm_municipio-\"" + municipio + "\"";
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then(
        (result) => {
          var infoMunicipio = result.data.dataset;
          if (infoMunicipio.length > 0) {
            VueCookies.set("currentAnalysisUnit", infoMunicipio[0].cd_municipio_ibge_dv, -1); // Never expires
            this.currentAnalysisUnit = infoMunicipio[0].cd_municipio_ibge_dv;
            return infoMunicipio[0];
          } else {
            throw "Localidade não encontrada!";
          }
        },
        (error) => { reject(); }
      );
  }

  setPlace(name, data){
    this[name] = data;
  }

  getPlace(name){
    return this[name];
  }

  getPRTPTMInstance(scope, id) {
    let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct&filtros=eq-cd_unidade-" + id;
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then(result => {
        var infoUnidade =result.data.dataset;
        if (infoUnidade.length > 0) {
          resolve({
            id_localidade: infoUnidade[0].cd_unidade,
            nm_localidade: infoUnidade[0].nm_unidade,
            tipo: scope
          });
        } else {
          callback(null);
        }
      }, error => {
        reject("Falha ao buscar total das localidades");
      });
  }

  getUFFromPlace(id) {
    for (let item of this.options) {
      if (item.id == id) {
        return item.uf;
      }
    }
    return null;
  }

  buildAllSearchOptions(scope = null) {
    //this.buildMPTOptions(scope);
    return [ // Promises
      this.buildPlacesOptions(scope)
    ];
  }
  
  buildMPTOptions(scope = null) {
    if (scope == null || scope.includes('MPT')) {
      let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct";
      return axios(this.axiosSetup.getAxiosOptions(url))
        .then((result) => {
          let unidadesMPT = result.data.dataset;
          
          for (let indxPRT in unidadesMPT) {
            this.options.push({
              id: unidadesMPT[indxPRT].cd_unidade,
              uf: unidadesMPT[indxPRT].cd_uf,
              label: unidadesMPT[indxPRT].nm_unidade,
              scope: 'prt',
              detail: "Unidade MPT",
              icon: "business",
              to: "/localidade/" + unidadesMPT[indxPRT].cd_unidade + "?",
              type: "place"
            });
          }
          return 'SUCCESS';
        }, (error) => { reject(error); }
      );
    }
  }

  buildPlacesOptions(scope = null) {
    this.loadStatus.places = 'LOADING';

    if (scope == null || scope.includes('Brasil')) {
      this.options.push({
        id: 0,
        label: "Brasil",
        scope: 'br',
        detail: "País",
        icon: "location_on",
        to: "/localidade/0?",
        type: "place",
        exclude_from: ["td"]
      });
    }

    let url = "/municipios?categorias=cd_municipio_ibge_dv,nm_municipio_uf,cd_uf,nm_uf,cd_mesorregiao,nm_mesorregiao,cd_microrregiao,nm_microrregiao&ordenacao=cd_municipio_ibge_dv";
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then((result) => {
        let municipios = result.data.dataset;
        //let cd_regiao = 0;
        //let added_meso = [];
        //let added_micro = [];
        let cd_uf = 0;
        for (let indxMunicipio in municipios) {
          // if (scope == null || scope.includes('Região')) {
          //   let nm_regiao = this.getRegion(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1));

          //   // Inclui a região no select
          //   if (cd_regiao != parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1))) {
          //     cd_regiao = parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 1));
          //     this.options.push({
          //       id: cd_regiao,
          //       label: nm_regiao,
          //       scope: 'reg',
          //       to: "/localidade/" + cd_regiao + "?",
          //       detail: "Região",
          //       icon: "location_on",
          //       type: "place"
          //     });
          //   }
          // }

          if (scope == null || scope.includes('Estado')) {
            // Inclui a UF no select
            if (cd_uf != parseInt(municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 2))) {
              cd_uf = municipios[indxMunicipio].cd_municipio_ibge_dv.toString().substring(0, 2);
              this.options.push({
                id: cd_uf,
                label: municipios[indxMunicipio].nm_uf,
                scope: 'uf',
                to: "/localidade/" + cd_uf + "?",
                detail: "Unidade Federativa",
                icon: "location_on",
                type: "place",
                exclude_from: ["td"]
              });
            }
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

          if (scope == null || scope.includes('Município')) {
            // Inclui o município no select
            this.options.push({
              id: municipios[indxMunicipio].cd_municipio_ibge_dv,
              label: municipios[indxMunicipio].nm_municipio_uf,
              scope: 'mun',
              to: "/localidade/" + municipios[indxMunicipio].cd_municipio_ibge_dv + "?",
              detail: "Município",
              icon: "location_on",
              type: "place"
            });
          }
        }
        this.loadStatus.places = 'SUCCESS';
        return 'SUCCESS';
      }, (error) => {
        this.loadStatus.places = 'ERROR';
        reject(error);
      }
    );
  }

  getRegion(idRegiao) {
    var regiao = null;
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
      default:
        regiao = "Região não identificada"
    }
    return regiao;
  }

  getTotalMunicipios() {
    var url = "/municipios?categorias=cd_municipio_ibge_dv";
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then(
        (result) => { return result.data.dataset.length; },
        (error) => { reject("Falha ao buscar total das localidades"); }
      );
  }

  getTotalMunicipiosPorUF(uf) {
    var url = "/municipios?categorias=cd_municipio_ibge_dv,cd_uf&filtros=eq-cd_uf-"+uf;
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then(
        (result) => { return result.data.dataset.length; },
        (error) => { reject("Falha ao buscar total das localidades"); }
      );
  }

  findAllUF() {
    var url = "/municipios?categorias=cd_uf,sg_uf,nm_uf&valor=cd_uf&agregacao=distinct";
    return axios(this.axiosSetup.getAxiosOptions(url))
      .then(
        (result) => { return result.data.dataset; },
        (error) => { reject("Falha ao buscar Unidades Federativas"); }
      );
  }

  getStateFromId(idLoc) {
    return idLoc.substring(0,2);
  }

  findCurrentPlace() { // TODO Adjust to promise
    return this.findPlaceByID(this.getCurrentAnalysisUnit());
  }

  findPlaceByID(id) {
    var url = null;
    var localidade = {};

    if (id === null || id === undefined) return;

    if (id == 0){ //Brasil
      localidade.id_localidade = 0;
      localidade.nm_localidade = 'Brasil';
      localidade.tipo = '';
      localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

      return localidade;
    } else if (id.length == 1){ //Região
      localidade.id_localidade = id;
      localidade.nm_localidade = this.getRegion(id);
      localidade.tipo = '';
      localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

      // return localidade;
    } else if (id.length == 2){ //Estado
      url = "/municipios?categorias=cd_uf,nm_uf&filtros=eq-cd_uf-" + id;
      return axios(this.axiosSetup.getAxiosOptions(url))
        .then(result => {
          localidade = result.data.dataset[0];
          localidade.id_localidade = localidade.cd_uf;
          localidade.nm_localidade = localidade.nm_uf;
          localidade.tipo = 'UF';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

          return localidade;
        }, error => {
          reject("Falha ao buscar dados do estado");
        });
    } else if (id.length == 4){ //Mesorregião
      url = "/municipios?categorias=cd_mesorregiao,nm_mesorregiao&filtros=eq-cd_mesorregiao-" + id;
      return axios(this.axiosSetup.getAxiosOptions(url))
        .then(result => {
          localidade = result.data.dataset[0];
          localidade.id_localidade = localidade.cd_mesorregiao;
          localidade.nm_localidade = localidade.nm_mesorregiao;
          localidade.tipo = 'Mesorregião';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

          // return localidade;
        }, error => {
          reject("Falha ao buscar dados da mesorregião");
        });
    } else if (id.length == 5){ //Microrregião
      url = "/municipios?categorias=cd_microrregiao,nm_microrregiao,latitude,longitude&filtros=eq-cd_microrregiao-" + id;
      return axios(this.axiosSetup.getAxiosOptions(url))
        .then(result => {
          localidade = result.data.dataset[0];
          localidade.id_localidade = localidade.cd_microrregiao;
          localidade.nm_localidade = localidade.nm_microrregiao;
          localidade.tipo = 'Microrregião';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
          
          // return localidade;
        }, error => {
          reject("Falha ao buscar dados da microrregião");
        });
    } else {
      url = "/municipio/" + id;
      return axios(this.axiosSetup.getAxiosOptions(url))
        .then(result => {
          localidade = result.data[0];
          localidade.id_localidade = localidade.cd_municipio_ibge_dv;
          localidade.nm_localidade = localidade.nm_municipio_uf;
          localidade.tipo = 'Município';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
          return localidade;
        }, error => {
          reject("Falha ao buscar dados do município");
        });
    }
  }
}

export default AnalysisUnitModel;
