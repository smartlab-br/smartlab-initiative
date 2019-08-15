import axios from 'axios'

const PlacesModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          placePRTPTM: [
            { id: 'PRT120500000', uf: 29, label: "PRT 5a Região - Sede" }
          ]
        }
      },
      methods: {
        getIdLocalidade(estado, municipio, setCookie, callback) {
          let url = "/municipios?categorias=cd_municipio_ibge_dv,nm_municipio_uf-nm_localidade&filtros=eq-nm_uf-\"" + estado + "\",and,eq-nm_municipio-\"" + municipio + "\"";
          axios(this.getAxiosOptions(url))
            .then(result => {
              var infoMunicipio = JSON.parse(result.data).dataset;
              if (infoMunicipio.length > 0) {
                if (callback) callback(infoMunicipio[0]);
                this.$cookies.set("currentAnalysisUnit", infoMunicipio[0].cd_municipio_ibge_dv, -1); // Never expires
                this.$store.state.favLocation = infoMunicipio[0].cd_municipio_ibge_dv;
              } else {
                this.$emit('showLocationDialog');
                if (callback) callback(null);
              }
            }, error => {
              this.$emit('showLocationDialog');
              // console.error(error.toString());
              // this.sendError("Falha ao buscar total das localidades");
              // reject({ code: 500 });
            });
        },

        getPRTPTMInstance(scope, id, callback) {
          let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct&filtros=eq-cd_unidade-" + id;
          axios(this.getAxiosOptions(url))
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
              console.error(error.toString());
              this.sendError("Falha ao buscar total das localidades");
              reject({ code: 500 });
            });
        },

        getUFFromPlace(id) {
          for (let item in this.$store.state.searchDataset.dataset) {
            if (this.$store.state.searchDataset.dataset[item].id == id) {
              return this.$store.state.searchDataset.dataset[item].uf;
            }
          }
          return null;
        },

        buildAllSearchOptions(scope = null) {
          //this.buildMPTOptions(scope);
          this.buildPlacesOptions(scope);
        },
        
        buildMPTOptions(scope = null) {
          if (scope == null || scope.includes('MPT')) {
            let url = "/municipios?categorias=cd_unidade,nm_unidade,cd_uf&agregacao=distinct";
            axios(this.getAxiosOptions(url))
              .then(result => {
                let unidadesMPT = JSON.parse(result.data).dataset;
                
                for (let indxPRT in unidadesMPT) {
                  this.$store.state.searchDataset.dataset.push({
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
                    this.$store.state.searchDataset.loadStatus['mpt_units'] = 'SUCCESS';
                  }
                }
              }, error => {
                console.error(error.toString());
                this.sendError("Falha ao buscar total das localidades");
                reject({ code: 500 });
              });
          }
        },

        buildPlacesOptions(scope = null) {
          if (scope == null || scope.includes('Brasil')) {
            this.$store.state.searchDataset.dataset.push({
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
          axios(this.getAxiosOptions(url))
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
                //     this.$store.state.searchDataset.dataset.push({
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
                    this.$store.state.searchDataset.dataset.push({
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
                //   this.$store.state.searchDataset.dataset.push({
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
                //   this.$store.state.searchDataset.dataset.push({
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
                  this.$store.state.searchDataset.dataset.push({
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
                  this.$store.state.searchDataset.loadStatus['places'] = 'SUCCESS';
                }
              }
            }, error => {
              console.error(error.toString());
              this.$store.state.searchDataset.loadStatus['places'] = 'ERROR';
              this.sendError("Falha ao buscar lista das localidades");
            });
        },

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
        },

        setTotalMunicipios(callback, cb_args) {
          var url = "/municipios?categorias=cd_municipio_ibge_dv";
          axios(this.getAxiosOptions(url))
            .then(result => {
              var nu_args = cb_args.slice(0, 3);
              nu_args.push(JSON.parse(result.data).dataset.length);
              callback.apply(null, nu_args);
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar total das localidades");
              reject({ code: 500 });
            });
        },

        setTotalMunicipiosPorUF(uf, callback, cb_args) {
          var url = "/municipios?categorias=cd_municipio_ibge_dv,cd_uf&filtros=eq-cd_uf-"+uf;
          axios(this.getAxiosOptions(url))
            .then(result => {
              var nu_args = cb_args.slice(0, 3);
              nu_args.push(JSON.parse(result.data).dataset.length);
              callback.apply(null, nu_args);
            }, error => {
              console.error(error.toString());
              this.sendError("Falha ao buscar total das localidades");
              reject({ code: 500 });
            });
        },

        findAllUF(callback, cb_args) {
          var url = "/municipios?categorias=cd_uf,sg_uf,nm_uf&valor=cd_uf&agregacao=distinct";
          axios(this.getAxiosOptions(url))
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
              console.error(error.toString());
              this.sendError("Falha ao buscar Unidades Federativas");
              reject({ code: 500 });
            });
        },

        getStateFromId(idLoc) {
          return idLoc.substring(0,2);
        },

        findPlaceByID(id, map, cb) {
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
            axios(this.getAxiosOptions(url))
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
                console.error(error.toString());
                this.sendError("Falha ao buscar dados do estado");
              });
          } else if (id.length == 4){ //Mesorregião
            url = "/municipios?categorias=cd_mesorregiao,nm_mesorregiao&filtros=eq-cd_mesorregiao-" + id;
            axios(this.getAxiosOptions(url))
              .then(result => {
                localidade = JSON.parse(result.data).dataset[0];
                localidade.id_localidade = localidade.cd_mesorregiao;
                localidade.nm_localidade = localidade.nm_mesorregiao;
                localidade.tipo = 'Mesorregião';
                localidade.img = "/static/thumbs/municipios/" + id + ".jpg";

                // cb(localidade, map);
              }, error => {
                console.error(error.toString());
                this.sendError("Falha ao buscar dados da mesorregião");
              });
          } else if (id.length == 5){ //Microrregião
            url = "/municipios?categorias=cd_microrregiao,nm_microrregiao,latitude,longitude&filtros=eq-cd_microrregiao-" + id;
            axios(this.getAxiosOptions(url))
              .then(result => {
                localidade = JSON.parse(result.data).dataset[0];
                localidade.id_localidade = localidade.cd_microrregiao;
                localidade.nm_localidade = localidade.nm_microrregiao;
                localidade.tipo = 'Microrregião';
                localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
                
                // cb(localidade, map);
              }, error => {
                console.error(error.toString());
                this.sendError("Falha ao buscar dados da microrregião");
              });
          } else {
            url = "/municipio/" + id;
            axios(this.getAxiosOptions(url))
              .then(result => {
                localidade = JSON.parse(result.data)[0];
                localidade.id_localidade = localidade.cd_municipio_ibge_dv;
                localidade.nm_localidade = localidade.nm_municipio_uf;
                localidade.tipo = 'Município';
                localidade.img = "/static/thumbs/municipios/" + id + ".jpg";
                this.localidade = localidade;
                if (cb){
                  cb(localidade, map);
                }
              }, error => {
                console.error(error.toString());
                this.sendError("Falha ao buscar dados do município");
              });
          }
        },

        checkFavoriteAnalysisUnit() {
          if (this.idObservatorio && this.idObservatorio == 'td' && 
            this.$cookies.isKey("currentAnalysisUnit") && this.$cookies.get("currentAnalysisUnit").length != 7){
            this.$emit('showLocationDialog');
          } else if (!this.$cookies.isKey("currentAnalysisUnit") || this.$cookies.get("currentAnalysisUnit") == null ) {
            // Se não houver cookie, invoca o cliente geo_ip
            this.getClientGeo(this.getClientGeoCallback);
            // this.$emit('showLocationDialog');
          } else {
            this.$store.state.favLocation = this.$cookies.get("currentAnalysisUnit");
            // this.getGlobalDatasetsIdLocalidade(this.$cookies.get("currentAnalysisUnit"));
          }
        },
      }
    })
  }
}

export default PlacesModel;
