import axios from 'axios'

const DatasetManager = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          datasetEndpoints: {
            centralindicadores: {
              municipio: '/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge,ds_fonte,vl_indicador,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT',
              estado: '/indicadoresestaduais?categorias=nm_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_mun_ibge,ds_fonte,vl_indicador,vl_indicador_br,rank_br,rank_br_total,rank_uf_total,pct_br,media_br&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT',
              brasil: '/indicadoresnacionais?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,ds_fonte,vl_indicador&agregacao=DISTINCT',
              mptreg: '/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_prt,ds_fonte,vl_indicador,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_prt-{0}&agregacao=DISTINCT',
              prtptm: '/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_unidade,cd_prt,nm_unidade,sg_unidade,ds_fonte,vl_indicador,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_unidade-{0}&agregacao=DISTINCT',
            },
            trabalho_escravo: {
              municipio: '/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv,vl_indicador,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge_dv-{0}&agregacao=DISTINCT',
              estado: '/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador,rank_br,rank_br_total,pct_br,media_br,vl_indicador_br&filtros=eq-cd_uf-{0}&agregacao=DISTINCT',
              brasil: '/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador&agregacao=DISTINCT'
            },
            trabalho_escravo_agr: {
              municipio: '/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_mun_ibge_dv-{0}',
              estado: '/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_uf-{0}',
              brasil: '/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM'
            },
            censo_agro_2017: {
              municipio: "/ti/censoagromunicipal?categorias='agro_menores'-cd_indicador,'2017'-nu_competencia,cod_mun,qt_ocupados,qt_ocupados_menores14,percent_ocupados_men_14&filtros=eq-cod_mun-{0}",
              estado: "/ti/censoagroestadual?categorias='agro_menores'-cd_indicador,'2017'-nu_competencia,cd_uf,tot_ocupados,tot_ocup_men14,perc_tot_14,men_14_parente,part_com_parentesco,men_14_sem_parente,part_sem_parentesco&filtros=eq-cd_uf-{0}",
              brasil: "/ti/censoagronacional?categorias='agro_menores'-cd_indicador,'2017'-nu_competencia,tot_ocupados,tot_ocup_men14,perc_tot_14,men_14_parente,part_com_parentesco,men_14_sem_parente,part_sem_parentesco"
            },
            munic: {
              municipio: '/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,total_uf,presenca_total_uf,pct_presenca_uf,nm_municipio,nm_uf,sg_uf,nm_municipio_uf&filtros=eq-cd_mun_ibge-{0}',
              estado: '/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,total_uf,presenca_total_uf,pct_presenca_uf,rank_pct_uf,rank_pct_uf_max,nm_municipio,nm_uf,sg_uf,nm_municipio_uf&valor=cd_uf&agregacao=DISTINCT&filtros=eq-cd_uf-{0}',
              brasil: '/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,nu_ano_indicador-nu_competencia,tema,sub_tema,ds_indicador,ds_fonte,presenca_total_br,total_br,pct_presenca_br,spai_ds_texto&valor=cd_indicador_spai&agregacao=DISTINCT'
            },
            estadic: {
              estado: '/estadicuf?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,nm_uf,sg_uf&filtros=eq-cd_uf-{0}',
              brasil: '/estadicuf?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,tema,ds_indicador,ds_fonte,sub_tema,presenca_total_br,pct_presenca_br,nu_ano_indicador-nu_competencia&agregacao=DISTINCT'
            }
          }
        }
      },

      methods: {
        melt(dataset, value_field, layer_fields, layer_field, 
             label_fields, label_field, value_function) {
          var meltedDS = [];
          for (var indxDS in dataset) {
            // Instantiates the base object for all layers in each dataset row
            var baseNuRow = dataset[indxDS];

            // Sets layer value fields
            for (var indxLayer in layer_fields) {
              // Instantiates a new object for each layer
              var nuRow = {};
              Object.assign(nuRow, baseNuRow);
              nuRow[layer_field] = layer_fields[indxLayer];
              nuRow[label_field] = label_fields[indxLayer];

              if (value_function) {
                nuRow[value_field] = value_function(dataset[indxDS][layer_fields[indxLayer]]);
              } else {
                nuRow[value_field] = dataset[indxDS][layer_fields[indxLayer]];
              }
              
              // Pushes each row to the resulting dataset
              meltedDS.push(nuRow);
            }
          }
          // Returns the resuting melted dataset
          return meltedDS;
        },

        // UNTESTED
        cast(dataset, col_fields, value_field, layer_field) {
          let result = [];
          for (var indxDS in dataset) {
            // Verifica se já existe a entrada no dataset de resultado
            let found = true;
            loopResult: for (var indxRes in result) {
              // Itera nos campos de identificação, para checar se é a mesma ocorrência
              for (let indxCol in col_fields) {
                if (result[indxRes][col_fields[indxCol]] != dataset[indxDS][col_fields[indxCol]]) {
                  found = false;
                  break loopResult;
                }
              }
              // Found is true and it'the current indxRes
              // Sets the new value column to the existing result row
              result[dataset[indxDS][layer_field]] = dataset[indxDS][value_field];
            }

            // Creates new row if not found in result
            if (!found) {
              // Instantiates the base object for all layers in each dataset row
              var nuRow = {};
              // Sets identifier columns' values
              for (let indxCol in col_fields) {
                nuRow[col_fields[indxCol]] = dataset[indxDS][col_fields[indxCol]];
              }
              // Sets the pivot value
              nuRow[dataset[indxDS][layer_field]] = dataset[indxDS][value_field];
              // Adds row to the result
              result.push(nuRow);
            }
          }
        },

        sortObject(object, order_field){
          return object.sort(function(a,b){ 
            if (a[order_field] > b[order_field]) {
              return 1;
            }
            if (a[order_field] < b[order_field]) {
              return -1;
            }
            return 0;});
        },

        setDataset(dataset, rules, structure, addedParams, metadata) {
          let limCoords = { xmin: null, ymin: null, xmax: null, ymax: null }; // Obtém coordenadas limítrofes (se mapa)
  
          let options = structure.chart_options;
          if (options === null || options === undefined) {
            options = structure.options;
          }
  
          for (var eachRow in dataset) {
            if (options.pct_field !== null && options.pct_field !== undefined) {
              dataset[eachRow].pct_indicador = dataset[eachRow][options.pct_field];
            }
            if (structure.chart_type == 'TREEMAP' && options.format_function !== null && options.format_function !== undefined) {
              if (this.customFunctions && this.customFunctions[options.format_function]) {
                dataset[eachRow][options.id] = this.customFunctions[options.format_function](dataset[eachRow], options);
              } else {
                dataset[eachRow][options.id] = this[options.format_function](dataset[eachRow], options);
              }
            }
  
            // Obtém coordenadas limítrofes (se mapa)
            if (structure.chart_type === 'MAP_LEAFLET') { // Só avalia as coordenadas caso o gráfico seja um mapa.
              // Ignora os pontos 0x0
              if (parseFloat(dataset[eachRow][options.long]) != 0 && 
                  parseFloat(dataset[eachRow][options.long]) != 0) {
                if (limCoords.xmin === null || limCoords.xmin === undefined) { // Primeiro valor de indicador
                  limCoords.xmin = parseFloat(dataset[eachRow][options.long]);
                  limCoords.xmax = parseFloat(dataset[eachRow][options.long]);
                  limCoords.ymin = parseFloat(dataset[eachRow][options.lat]);
                  limCoords.ymax = parseFloat(dataset[eachRow][options.lat]);
                } else {
                  var lat = parseFloat(dataset[eachRow][options.lat]);
                  var long = parseFloat(dataset[eachRow][options.long]);
                  if (limCoords.xmin > long) {
                    limCoords.xmin = long;
                  }
                  if (limCoords.xmax < long) {
                    limCoords.xmax = long;
                  }
                  if (limCoords.ymin > lat) {
                    limCoords.ymin = lat;
                  }
                  if (limCoords.ymax < lat) {
                    limCoords.ymax = lat;
                  }
                }
              }
            }
          }
  
          // Define as coordenadas apenas se for um mapa do leaflet
          if (structure.chart_type === 'MAP_LEAFLET') {
            this.customParams.limCoords = limCoords;
          }
  
          if (options.order_field !== null && options.order_field !== undefined) {
            dataset = this.sortObject(dataset, options.order_field);
          }
  
          if (addedParams && addedParams.id) {
            // Múltiplos gráficos
            this.dataset[addedParams.id] = dataset;
            this.metadata[addedParams.id] = metadata;
            this.datasetsComplete++;
          } else if (addedParams && addedParams.props) {
            if (addedParams.props.dataset) this[addedParams.props.dataset] = dataset;
            if (addedParams.props.metadata) this[addedParams.props.metadata] = metadata;
          } else {
            // Dataset único
            this.dataset = dataset;
            this.metadata = metadata;
          }

          if (addedParams && addedParams.fnCallback) {
            addedParams.fnCallback();
          }
        },
        
        getSourceDesc(structure, dataset, metadata) {
          if (structure) {
            if (structure.source && structure.source.desc) {
              return structure.source.desc;
            } else if (dataset && structure.source && structure.source.desc_field && dataset[0]) {
              return dataset[0][structure.source.desc_field] != null ? dataset[0][structure.source.desc_field] : null;
            } else if (metadata && metadata.fonte) {
              return metadata.fonte;
            }
          } else if (metadata && metadata.fonte) {
            return metadata.fonte;
          }  
          return null;
        },

        getSourceLink(structure, dataset, metadata) {
          if (structure) {
            if (structure.source && structure.source.link) {
              return structure.source.link;
            } else if (dataset !== null && structure.source && structure.source.link_field && dataset[0]) {
              return dataset[0][structure.source.link_field] != null ? dataset[0][structure.source.link_field] : null;
            }
          } else if (metadata && metadata.link) {
            return metadata.link;
          }
          return null;
        },

        getAnalysisDesc(structure, dataset, metadata) {
          if (structure) {
            if (structure.analysis && structure.analysis.desc) {
              return structure.analysis.desc;
            } else if (dataset && structure.analysis && structure.analysis.desc_field && dataset[0]) {
              return dataset[0][structure.analysis.desc_field] != null ? dataset[0][structure.analysis.desc_field] : null;
            }
          } else if (metadata && metadata.analysis) {
            return metadata.analysis;
          }  
          return "SmartLab";
        },

        getAnalysisLink(structure, dataset, metadata) {
          if (structure) {
            if (structure.analysis && structure.analysis.link) {
              return structure.analysis.link;
            } else if (dataset !== null && structure.analysis && structure.analysis.link_field && dataset[0]) {
              return dataset[0][structure.analysis.link_field] != null ? dataset[0][structure.analysis.link_field] : null;
            }
          } else if (metadata && metadata.analyis && metadata.analysis.link) {
            return metadata.analysis.link;
          }
          return null;
        },

        getMinMax(dataset, value_field) {
          // Obtém o min e o max
          let min, max = null;
          for (let indxDS in dataset) {
            if (min == null || min > parseFloat(dataset[indxDS][value_field])) {
              min = parseFloat(dataset[indxDS][value_field]);
            }
            if (max == null || max < parseFloat(dataset[indxDS][value_field])) {
              max = parseFloat(dataset[indxDS][value_field]);
            }
          }
          return [min, max];
        },

        getMinMaxEachIndicator(dataset, value_field) {
          // Obtém o min e o max
          let min = [];
          let max = [];
          for (let indxDS in dataset) {
            if (this.$indicatorsModel.isMinInYear({}, dataset, dataset[indxDS], value_field)) {
              min.push(dataset[indxDS]);
            }
            if (this.$indicatorsModel.isMaxInYear({}, dataset, dataset[indxDS], value_field)) {
              max.push(dataset[indxDS]);
            }
          }

          // Itera no dataset, incluindo os atributos minVal e maxVal
          for (let indxDS in dataset) {
            // Atribui o minimo
            for (let indxMin in min) {
              if (dataset[indxDS].cd_indicador !== min[indxMin].cd_indicador) {
                continue;
              }
              if (dataset[indxDS].nu_competencia !== min[indxMin].nu_competencia) {
                continue;
              }
              dataset[indxDS].minVal = min[indxMin][value_field];
              break;
            }
            // Atribui o maximo
            for (let indxMax in max) {
              if (dataset[indxDS].cd_indicador !== max[indxMax].cd_indicador) {
                continue;
              }
              if (dataset[indxDS].nu_competencia !== max[indxMax].nu_competencia) {
                continue;
              }
              dataset[indxDS].maxVal = max[indxMax][value_field];
              break;
            }
          }
          // Retorna o dataset preenchido
          return dataset;
        },

        getGlobalDatasets() {
          return this.$store.state.gDatasets;
        },

        getGlobalDataset(dataset, scope, msg_erro, auId = null, cb = null, suffix = "") {
          let datasetSuffix = dataset + suffix;
          if (this.$store.state.gDatasets[datasetSuffix] == null || this.$store.state.gDatasets[datasetSuffix] == undefined ||
              this.$store.state.gDatasets[datasetSuffix].analysisUnit == null || this.$store.state.gDatasets[datasetSuffix].analysisUnit == undefined ||
              this.$store.state.gDatasets[datasetSuffix].analysisUnit.type != scope || this.$store.state.gDatasets[datasetSuffix].analysisUnit.id != auId
            ) {
            this.$store.state.gDatasets[datasetSuffix] = { ds: null, valid: false, analysisUnit: { type: scope, id: auId } };
            this.setGlobalDataset(dataset, scope, msg_erro, auId, cb, suffix);
          } else if (cb) {
            cb(null);
          }
        },

        getMultipleGlobalDatasets(thematicDatasets, scope, auId, cb = null, suffix = "") {
          let nLoadedDS = 0;

          for (let indxDS in thematicDatasets) {
            let dataset = thematicDatasets[indxDS] + suffix;
            let endpointName = thematicDatasets[indxDS];
            if (this.$store.state.gDatasets[dataset] == null || this.$store.state.gDatasets[dataset] == undefined ||
              this.$store.state.gDatasets[dataset].analysisUnit == null || this.$store.state.gDatasets[dataset].analysisUnit == undefined ||
              this.$store.state.gDatasets[dataset].analysisUnit.type != scope || this.$store.state.gDatasets[dataset].analysisUnit.id != auId
              ) {
              this.$store.state.gDatasets[dataset] = { ds: null, valid: false, analysisUnit: { type: scope, id: auId } };
              
              let url = this.replaceArgs(this.datasetEndpoints[endpointName][scope], [auId]);

              // Busca o dataset da localidade
              axios(this.getAxiosOptions(url))
                .then(result => {
                  this.$store.state.gDatasets[dataset] = {
                    ds: JSON.parse(result.data).dataset,
                    valid: true
                  };
                  if (cb && ++nLoadedDS == thematicDatasets.length) cb(null);
                }, error => {
                  this.sendError('Erro ao carregar dataset temático');
                });
            } else {
              if (cb && ++nLoadedDS == thematicDatasets.length) cb(null);
            }
          }
        },

        setGlobalDataset(dataset, scope, msg_erro, auId = null, cb = null, suffix = "") {
          let url = this.replaceArgs(this.datasetEndpoints[dataset][scope], [auId]);
          //busca indicadores da localidade
          axios(this.getAxiosOptions(url))
            .then(result => {
              this.$store.state.gDatasets[dataset + suffix] = {
                ds: JSON.parse(result.data).dataset,
                valid: true
              };
              if (cb) cb(null);
            }, error => {
              console.error(error.toString());
              this.sendError(msg_erro);
            });
        }
      }
    })
  }
}

export default DatasetManager;
