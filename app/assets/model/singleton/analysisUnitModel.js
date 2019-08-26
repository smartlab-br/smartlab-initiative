import axios from 'axios'
import VueCookies from 'vue-cookies'

class AnalysisUnitModel {
  placePRTPTM = [
    { id: 'PRT120500000', uf: 29, label: "PRT 5a Região - Sede" }
  ]
  currentAnalysisUnit = null
  
  constructor() {}

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

  getIdLocalidade(context, estado, municipio, setCookie, callback) {
    let url = "/municipios?categorias=cd_municipio_ibge_dv,nm_municipio_uf-nm_localidade&filtros=eq-nm_uf-\"" + estado + "\",and,eq-nm_municipio-\"" + municipio + "\"";
    axios(context.getAxiosOptions(url))
      .then(result => {
        var infoMunicipio = JSON.parse(result.data).dataset;
        if (infoMunicipio.length > 0) {
          if (callback) callback(infoMunicipio[0]);
          VueCookies.set("currentAnalysisUnit", infoMunicipio[0].cd_municipio_ibge_dv, -1); // Never expires
          this.currentAnalysisUnit = infoMunicipio[0].cd_municipio_ibge_dv;
        } else {
          context.$emit('showLocationDialog');
          if (callback) callback(null);
        }
      }, error => {
        context.$emit('showLocationDialog');
      });
  }

  getPRTPTMInstance(context, scope, id, callback) {
    let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct&filtros=eq-cd_unidade-" + id;
    axios(context.getAxiosOptions(url))
      .then(result => {
        var infoUnidade = JSON.parse(result.data).dataset;
        if (infoUnidade.length > 0) {
          callback({
            id_localidade: infoUnidade[0].cd_unidade,
            nm_localidade: infoUnidade[0].nm_unidade,
            tipo: scope
          });
        } else {
          callback(null);
        }
      }, error => {
        // console.error(error.toString());
        context.sendError("Falha ao buscar total das localidades");
        reject({ code: 500 });
      });
  }

  getUFFromPlace(context, id) {
    for (let item in context.$store.state.searchDataset.dataset) {
      if (context.$store.state.searchDataset.dataset[item].id == id) {
        return context.$store.state.searchDataset.dataset[item].uf;
      }
    }
    return null;
  }

  buildAllSearchOptions(context, scope = null) {
    //this.buildMPTOptions(scope);
    this.buildPlacesOptions(context, scope);
  }
  
  buildMPTOptions(context, scope = null) {
    if (scope == null || scope.includes('MPT')) {
      let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct";
      axios(context.getAxiosOptions(url))
        .then(result => {
          let unidadesMPT = JSON.parse(result.data).dataset;
          
          for (let indxPRT in unidadesMPT) {
            context.$store.state.searchDataset.dataset.push({
              id: unidadesMPT[indxPRT].cd_unidade,
              uf: unidadesMPT[indxPRT].cd_uf,
              label: unidadesMPT[indxPRT].nm_unidade,
              scope: 'prt',
              detail: "Unidade MPT",
              icon: "business",
              to: "/localidade/" + unidadesMPT[indxPRT].cd_unidade + "?",
              type: "place"
            });

            if (indxPRT == unidadesMPT.length - 1) {
              context.$store.state.searchDataset.loadStatus['mpt_units'] = 'SUCCESS';
            }
          }
        }, error => {
          console.error(error.toString());
          context.sendError("Falha ao buscar total das localidades");
          reject({ code: 500 });
        });
    }
  }

  buildPlacesOptions(context, scope = null) {
    if (scope == null || scope.includes('Brasil')) {
      context.$store.state.searchDataset.dataset.push({
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
    axios(context.getAxiosOptions(url))
      .then(result => {
        let municipios = JSON.parse(result.data).dataset;
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
          //     context.$store.state.searchDataset.dataset.push({
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
              context.$store.state.searchDataset.dataset.push({
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
          //   context.$store.state.searchDataset.dataset.push({
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
          //   context.$store.state.searchDataset.dataset.push({
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
            context.$store.state.searchDataset.dataset.push({
              id: municipios[indxMunicipio].cd_municipio_ibge_dv,
              label: municipios[indxMunicipio].nm_municipio_uf,
              scope: 'mun',
              to: "/localidade/" + municipios[indxMunicipio].cd_municipio_ibge_dv + "?",
              detail: "Município",
              icon: "location_on",
              type: "place"
            });
          }

          if (indxMunicipio == municipios.length - 1) {
            context.$store.state.searchDataset.loadStatus['places'] = 'SUCCESS';
          }
        }
      }, error => {
        context.$store.state.searchDataset.loadStatus['places'] = 'ERROR';
        context.sendError("Falha ao buscar lista das localidades");
      });
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

  setTotalMunicipios(context, callback, cb_args) {
    var url = "/municipios?categorias=cd_municipio_ibge_dv";
    axios(context.getAxiosOptions(url))
      .then(result => {
        var nu_args = cb_args.slice(0, 3);
        nu_args.push(JSON.parse(result.data).dataset.length);
        callback.apply(null, nu_args);
      }, error => {
        context.sendError("Falha ao buscar total das localidades");
        reject({ code: 500 });
      });
  }

  setTotalMunicipiosPorUF(context, uf, callback, cb_args) {
    var url = "/municipios?categorias=cd_municipio_ibge_dv,cd_uf&filtros=eq-cd_uf-"+uf;
    axios(context.getAxiosOptions(url))
      .then(result => {
        var nu_args = cb_args.slice(0, 3);
        nu_args.push(JSON.parse(result.data).dataset.length);
        callback.apply(null, nu_args);
      }, error => {
        context.sendError("Falha ao buscar total das localidades");
        reject({ code: 500 });
      });
  }

  findAllUF(context, callback, cb_args) {
    var url = "/municipios?categorias=cd_uf,sg_uf,nm_uf&valor=cd_uf&agregacao=distinct";
    axios(context.getAxiosOptions(url))
      .then(result => {
        if (callback) {
          var nu_args = []
          nu_args.push(JSON.parse(result.data).dataset);
          nu_args.push(cb_args);
          callback.apply(null, nu_args);
        } else {
          return JSON.parse(result.data).dataset;
        }
      }, error => {
        context.sendError("Falha ao buscar Unidades Federativas");
        reject({ code: 500 });
      });
  }

  getStateFromId(idLoc) {
    return idLoc.substring(0,2);
  }

  findCurrentPlace(context, map, cb) {
    this.findPlaceByID(context, this.getCurrentAnalysisUnit(), map, cb);
  }

  findPlaceByID(context, id, map, cb) {
    var url = null;
    var localidade = {};

    if (id == 0){ //Brasil
      localidade.id_localidade = 0;
      localidade.nm_localidade = 'Brasil';
      localidade.tipo = '';
      localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

      cb(localidade, map);
    } else if (id.length == 1){ //Região
      localidade.id_localidade = id;
      localidade.nm_localidade = this.getRegion(id);
      localidade.tipo = '';
      localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

      // cb(localidade, map);
    } else if (id.length == 2){ //Estado
      url = "/municipios?categorias=cd_uf,nm_uf&filtros=eq-cd_uf-" + id;
      axios(context.getAxiosOptions(url))
        .then(result => {
          localidade = JSON.parse(result.data).dataset[0];
          localidade.id_localidade = localidade.cd_uf;
          localidade.nm_localidade = localidade.nm_uf;
          localidade.tipo = 'UF';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

          if (cb){
            cb(localidade, map);
          }
        }, error => {
          context.sendError("Falha ao buscar dados do estado");
        });
    } else if (id.length == 4){ //Mesorregião
      url = "/municipios?categorias=cd_mesorregiao,nm_mesorregiao&filtros=eq-cd_mesorregiao-" + id;
      axios(context.getAxiosOptions(url))
        .then(result => {
          localidade = JSON.parse(result.data).dataset[0];
          localidade.id_localidade = localidade.cd_mesorregiao;
          localidade.nm_localidade = localidade.nm_mesorregiao;
          localidade.tipo = 'Mesorregião';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

          // cb(localidade, map);
        }, error => {
          context.sendError("Falha ao buscar dados da mesorregião");
        });
    } else if (id.length == 5){ //Microrregião
      url = "/municipios?categorias=cd_microrregiao,nm_microrregiao,latitude,longitude&filtros=eq-cd_microrregiao-" + id;
      axios(context.getAxiosOptions(url))
        .then(result => {
          localidade = JSON.parse(result.data).dataset[0];
          localidade.id_localidade = localidade.cd_microrregiao;
          localidade.nm_localidade = localidade.nm_microrregiao;
          localidade.tipo = 'Microrregião';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
          
          // cb(localidade, map);
        }, error => {
          context.sendError("Falha ao buscar dados da microrregião");
        });
    } else {
      url = "/municipio/" + id;
      axios(context.getAxiosOptions(url))
        .then(result => {
          localidade = JSON.parse(result.data)[0];
          localidade.id_localidade = localidade.cd_municipio_ibge_dv;
          localidade.nm_localidade = localidade.nm_municipio_uf;
          localidade.tipo = 'Município';
          localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
          context.localidade = localidade;
          if (cb){
            cb(localidade, map);
          }
        }, error => {
          context.sendError("Falha ao buscar dados do município");
        });
    }
  }

  checkFavoriteAnalysisUnit(context) {
    if (context.idObservatorio && context.idObservatorio == 'td' && 
      VueCookies.isKey("currentAnalysisUnit") && VueCookies.get("currentAnalysisUnit").length != 7){
      context.$emit('showLocationDialog');
    } else if (!VueCookies.isKey("currentAnalysisUnit") || VueCookies.get("currentAnalysisUnit") == null ) {
      // Se não houver cookie, invoca o cliente geo_ip
      context.getClientGeo(context.getClientGeoCallback);
      // context.$emit('showLocationDialog');
    } else {
      this.currentAnalysisUnit = VueCookies.get("currentAnalysisUnit");
      // context.getGlobalDatasetsIdLocalidade(VueCookies.get("currentAnalysisUnit"));
    }
  }
}

export default AnalysisUnitModel;
