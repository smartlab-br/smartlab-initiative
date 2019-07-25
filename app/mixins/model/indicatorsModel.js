import axios from 'axios'

const IndicatorsModel = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        buildIndicatorsOptions(pusher, flare, observatory = null) {
          // O default é o TD
          var url = "/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct";
          if (observatory && observatory != 'td') {
            url = "/" + observatory + "te/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct";
          }

          axios(this.getAxiosOptions(url))
            .then(result => {
              var todosIndicadores = JSON.parse(result.data).dataset;

              for (var i = 0; i < todosIndicadores.length; i++) {
                var dim = this.findDimensionById(todosIndicadores[i].cd_dimensao);
                /*
                pusher({
                  id: todosIndicadores[i].nm_indicador,
                  label: todosIndicadores[i].ds_indicador_radical,
                  detail: "Mapa",
                  to: "/mapa/" + todosIndicadores[i].nm_indicador + "?type=topo&agregacao=mesorregiao",
                  icon: 'map', type: 'map'
                });
                */
                pusher({
                  id: todosIndicadores[i].cd_indicador,
                  label: todosIndicadores[i].ds_indicador_radical,
                  detail: "Indicador, " + dim.label,
                  to: "/localidade/0?dimensao=" + dim.id,
                  icon: 'dashboard',
                  type: 'indicator',
                  context: 'sim'
                });

                if (i == todosIndicadores.length - 1) {
                  flare({
                    id: 'indicators',
                    value: 'SUCCESS'
                  });
                }
              }
            }, error => {
              console.error(error.toString());
              flare({
                id: 'indicators',
                value: 'ERROR'
              });
              this.sendError("Falha ao buscar dados de indicadores");
              return null;
            });
        },

        indicatorsToValueArray(args, functions, indicators, cbInvalidate = null) {
          var values = [];
          for (var indx in args) {
            if (args[indx].id) {
              values = values.concat(this.getIndicatorValueFromStructure(args[indx], functions, indicators, cbInvalidate));
            } else if (args[indx].link) {
              values.push("<a href='" + args[indx].link + "'>" + args[indx].text + "</a>");
            } else {
              values.push(this.getAttributeFromIndicatorInstance(args[indx], functions, indicators[0], cbInvalidate));
            }
          }
          return values;
        },

        getIndicatorValueFromStructure(structure, functions, indicators, cbInvalidate = null) {
          for (var indxInd in indicators) {
            if (structure.id && structure.id !== indicators[indxInd].cd_indicador) {
              continue;
            }
            if (structure.year && structure.year !== indicators[indxInd].nu_competencia) {
              continue;
            }
            return this.getAttributeFromIndicatorInstance(structure, functions, indicators[indxInd], cbInvalidate);
          }
          if(structure.required && cbInvalidate !== null){
            cbInvalidate.apply(null);
          } else {
            return structure.default;
          }
        },

        slice(struct, indicators, functions = {}) {
          var result = [];
          for (var indxInd in indicators) {
            if (struct.id) {
              if (Array.isArray(struct.id)) {
                if (!struct.id.includes(indicators[indxInd].cd_indicador)) {
                  continue;
                }
              } else if (struct.id !== indicators[indxInd].cd_indicador) {
                continue;
              }
            }
            if (struct.year) {
              if (struct.year === 'max' && !this.isMaxOnSlice(struct, indicators, indicators[indxInd], 'nu_competencia')) {
                continue;
              } else if (struct.year === 'min' && !this.isMinOnSlice(struct, indicators, indicators[indxInd], 'nu_competencia')) {
                continue;
              } else if (struct.year !== 'max' && struct.year !== 'min' && struct.year !== indicators[indxInd].nu_competencia) {
                continue;
              }
            }
//            if (struct.serie && struct.serie !== indicators[indxInd].nm_serie_historica) {
//              continue;
//            }

            result.push(indicators[indxInd]);

            
          }

          if (struct.combine) {
            result = result.concat(this.combineIndicators(result, struct.combine, functions));
            if (struct.slice) {
              result = this.slice(struct.slice, result);
            }
          } 

          return result;
        },

        isMaxOnSlice(struct, indicators, current, prop) {
          let tmpResult = current[prop];
          for (var indxInd in indicators) {
            if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
              continue;
            }
            if (tmpResult === null) {
              tmpResult = indicators[indxInd][prop];
            } else if (tmpResult < indicators[indxInd][prop]) {
              tmpResult = indicators[indxInd][prop];
            }
          }
          return tmpResult == current[prop];
        },

        isMaxInYear(struct, indicators, current, prop) {
          let tmpResult = current[prop];
          for (var indxInd in indicators) {
            if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
              continue;
            }
            if (indicators[indxInd].nu_competencia !== current.nu_competencia) {
              continue;
            }
            if (tmpResult === null) {
              tmpResult = indicators[indxInd][prop];
            } else if (tmpResult < indicators[indxInd][prop]) {
              tmpResult = indicators[indxInd][prop];
            }
          }
          return tmpResult == current[prop];
        },

        isMinOnSlice(struct, indicators, current, prop) {
          let tmpResult = current[prop];
          for (var indxInd in indicators) {
            if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
              continue;
            }
            if (tmpResult === null) {
              tmpResult = indicators[indxInd][prop];
            } else if (tmpResult > indicators[indxInd][prop]) {
              tmpResult = indicators[indxInd][prop];
            }
          }
          return tmpResult == current[prop];
        },

        isMinInYear(struct, indicators, current, prop) {
          let tmpResult = current[prop];
          for (var indxInd in indicators) {
            if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
              continue;
            }
            if (indicators[indxInd].nu_competencia !== current.nu_competencia) {
              continue;
            }
            if (tmpResult === null) {
              tmpResult = indicators[indxInd][prop];
            } else if (tmpResult > indicators[indxInd][prop]) {
              tmpResult = indicators[indxInd][prop];
            }
          }
          return tmpResult == current[prop];
        },
        
        combineIndicators(sliced, struct, functions = {}, place_id_field = null) {
          let result = [];
          for (let eachRow in sliced) {
            let args = [];
            let addedSelf = false;
            let nuIndic = Object.assign({}, sliced[eachRow]);

            for (let indxCmb in struct) {
              let fnCmb = functions[struct[indxCmb].function];

              for (let indxArgs in struct[indxCmb].fn_args) {
                if (struct[indxCmb].fn_args[indxArgs].fixed != null && struct[indxCmb].fn_args[indxArgs].fixed != undefined){
                  args.push(struct[indxCmb].fn_args[indxArgs].fixed);
                } else {
                  nuIndic.cd_indicador = struct[indxCmb].id;
                  nuIndic.ds_indicador = struct[indxCmb].desc;
                  nuIndic.ds_agreg_primaria = struct[indxCmb].ds_agreg_primaria;
                  nuIndic.ds_agreg_secundaria = struct[indxCmb].ds_agreg_secundaria;
                  nuIndic.ds_indicador_radical = struct[indxCmb].desc;

                  if (!addedSelf) {
                    if (struct[indxCmb].fn_args[indxArgs].id !== undefined &&
                        struct[indxCmb].fn_args[indxArgs].id !== sliced[eachRow].cd_indicador) {
                      continue;
                    }
                    if (struct[indxCmb].year &&
                        struct[indxCmb].year !== sliced[eachRow].nu_competencia) {
                      continue;
                    }
                    addedSelf = true;

                    if (struct[indxCmb].fn_args[indxArgs].named_prop) {
                      args.push(sliced[eachRow][struct[indxCmb].fn_args[indxArgs].named_prop]);
                    } else {
                      args.push(sliced[eachRow].vl_indicador);
                    }
                  } else {
                    for (var indxInd in sliced) {
                      if (struct[indxCmb].fn_args[indxArgs].id !== undefined &&
                          struct[indxCmb].fn_args[indxArgs].id !== sliced[indxInd].cd_indicador) {
                        continue;
                      }
                      if (struct[indxCmb].fn_args[indxArgs].year &&
                          struct[indxCmb].fn_args[indxArgs].year !== sliced[indxInd].nu_competencia) {
                        continue;
                      }
                      if (place_id_field && sliced[eachRow][place_id_field] !== sliced[indxInd][place_id_field]) {
                        continue;
                      }
                      if (struct[indxCmb].fn_args[indxArgs].named_prop) {
                        args.push(sliced[indxInd][struct[indxCmb].fn_args[indxArgs].named_prop]);
                      } else {
                        args.push(sliced[indxInd].vl_indicador);
                      }
                      break;
                    }
                  }
                }
                //Se não encontrou arg e existe um valor default - inclui valor default
                if (args[indxArgs] == undefined && struct[indxCmb].fn_args[indxArgs].default){
                  args.push(struct[indxCmb].fn_args[indxArgs].default);
                }
              }

              if (args.length == struct[indxCmb].fn_args.length) {
                nuIndic.vl_indicador = fnCmb.apply(null, args);
              
                // Verifica se já existem os registro no dataset combinado
                let found = false;
                for (let indx in result) {
                  if (nuIndic.cd_indicador !== result[indx].cd_indicador) {
                    continue;
                  }
                  if (nuIndic.nu_competencia !== result[indx].nu_competencia) {
                    continue;
                  }
                  if (place_id_field != null && nuIndic[place_id_field] !== result[indx][place_id_field]) {
                    continue;
                  }
                  found = true;
                }
                if (!found) result.push(nuIndic);
              }
            }
          }

          return result;
        },

        getAttributeFromIndicatorInstance(structure, functions, indicator, cbInvalidate = null) {
          let value = null;
          // Pega ou calcula o valor
          if (structure && structure.function) {
            value = this.runNamedFunction(structure, indicator, functions);
          } else if (indicator && structure && structure.named_prop) {
            value = indicator[structure.named_prop];
          }
          
          // Formata o valor e inclui no array
          if(value !== null && value !== undefined && structure.format) {
            let formatRules = structure;
            if (structure.format == 'auto') {
              formatRules = this.getFormatRules(structure, indicator);
            }
            value = this.formatNumber(
              value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
            );
          } else if(structure && structure.required && value === null && cbInvalidate !== null){
            cbInvalidate.apply(null);
            if (structure.default) {
              value = structure.default;
            } else {
              value = "Sem Registros";
            }
          }

          if ((value === null || value === undefined) && structure && structure.default !== null && structure.default !== undefined) {
            value = structure.default;
          } else if (value == 0 && structure.zero) {
            value = structure.zero;
          }

          return value;
        }
      }
    })
  }
}

export default IndicatorsModel;
