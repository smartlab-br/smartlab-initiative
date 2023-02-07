import axios from 'axios'

// import AxiosCallSetupService from '../../service/singleton/axiosCallSetupService'
// import TextTransformService from '../../service/singleton/textTransformService'
// import NumberTransformService from '../../service/singleton/numberTransformService'
// import ObjectTransformService from '../../service/singleton/objectTransformService'

export class IndicatorsModel {
  options = []
  loadStatus = {
    places: null
  }

  idhLevels = [
    { cap: 0.5, name: 'Muito baixo', description: '(Abaixo de 0,500)' },
    { cap: 0.6, name: 'Baixo', description: '(0.500 a 0.599)' },
    { cap: 0.7, name: 'Médio', description: '(0.600 a 0.699)' },
    { cap: 0.8, name: 'Alto', description: '(0.700 a 0.799)' },
    { cap: null, name: 'Muito alto', description: '(0.800 ou superior)' }
  ]

  datasetEndpoints = {
    centralindicadores: {
      municipio: '/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,nm_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge,ds_fonte,vl_indicador,vl_indicador_txt,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT',
      estado: '/indicadoresestaduais?categorias=nm_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_mun_ibge,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_uf_total,pct_br,media_br&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT',
      brasil: '/indicadoresnacionais?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,ds_fonte,vl_indicador,vl_indicador_txt&agregacao=DISTINCT',
      mptreg: '/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_prt,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_prt-{0}&agregacao=DISTINCT',
      prtptm: '/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_unidade,cd_prt,nm_unidade,sg_unidade,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_unidade-{0}&agregacao=DISTINCT'
    },
    trabalho_escravo: {
      municipio: '/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv,vl_indicador,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge_dv-{0},and,nn-vl_indicador&agregacao=DISTINCT',
      estado: '/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador,rank_br,rank_br_total,pct_br,media_br,vl_indicador_br&filtros=eq-cd_uf-{0},and,nn-vl_indicador&agregacao=DISTINCT',
      brasil: '/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador&agregacao=DISTINCT&filtros=nn-vl_indicador'
    },
    trabalho_escravo_agr: {
      municipio: '/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_mun_ibge_dv-{0},and,nn-vl_indicador',
      estado: '/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_uf-{0},and,nn-vl_indicador',
      brasil: '/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM&filtros=nn-vl_indicador'
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

  globalDatasets = {}

  constructor (context) {
    this.context = context
  }

  getOptions () {
    return this.options
  }

  buildIndicatorsOptions (context, observatory = null) {
    this.loadStatus = 'LOADING'

    // O default é o TD
    let url = '/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct'
    if (observatory && observatory != 'td') {
      url = '/' + observatory + 'te/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct'
    }

    return axios(this.context.$axiosCallSetupService.getAxiosOptions(url))
      .then((result) => {
        const todosIndicadores = result.data.dataset

        for (let i = 0; i < todosIndicadores.length; i++) {
          const dim = context.findDimensionById(todosIndicadores[i].cd_dimensao)
          /*
          pusher({
            id: todosIndicadores[i].nm_indicador,
            label: todosIndicadores[i].ds_indicador_radical,
            detail: "Mapa",
            to: "/mapa/" + todosIndicadores[i].nm_indicador + "?type=topo&agregacao=mesorregiao",
            icon: 'map', type: 'map'
          });
          */
          this.options.push({
            id: todosIndicadores[i].cd_indicador,
            label: todosIndicadores[i].ds_indicador_radical,
            detail: 'Indicador, ' + dim.label,
            to: '/localidade/0?dimensao=' + dim.id,
            icon: 'dashboard',
            type: 'indicator',
            context: 'sim'
          })
        }

        this.loadStatus = 'SUCCESS'
        return this.options
      }, (error) => {
        this.loadStatus = 'ERROR'
        Promise.reject(error)
      })
  }

  indicatorsToValueArray (args, functions, indicators, cbInvalidate = null) {
    let values = []
    for (const indx in args) {
      if (args[indx].id) {
        values = values.concat(this.getIndicatorValueFromStructure(args[indx], functions, indicators, cbInvalidate))
      } else if (args[indx].link) {
        values.push("<a href='" + args[indx].link + "'>" + args[indx].text + '</a>')
      } else {
        values.push(this.getAttributeFromIndicatorInstance(args[indx], functions, indicators[0], cbInvalidate))
      }
    }
    return values
  }

  getIndicatorValueFromStructure (structure, functions, indicators, cbInvalidate = null) {
    for (const indxInd in indicators) {
      if (structure.id && structure.id !== indicators[indxInd].cd_indicador) {
        continue
      }
      if (structure.year && structure.year !== indicators[indxInd].nu_competencia) {
        continue
      }
      return this.getAttributeFromIndicatorInstance(structure, functions, indicators[indxInd], cbInvalidate)
    }
    if (structure.required && cbInvalidate !== null) {
      cbInvalidate.apply(null)
    } else {
      return structure.default
    }
  }

  slice (struct, indicators, functions = {}) {
    let result = []
    for (const indxInd in indicators) {
      if (struct.id) {
        if (Array.isArray(struct.id)) {
          if (!struct.id.includes(indicators[indxInd].cd_indicador)) {
            continue
          }
        } else if (struct.id !== indicators[indxInd].cd_indicador) {
          continue
        }
      }
      if (struct.year) {
        if (struct.year === 'max' && !this.isMaxOnSlice(struct, indicators, indicators[indxInd], 'nu_competencia')) {
          continue
        } else if (struct.year === 'min' && !this.isMinOnSlice(struct, indicators, indicators[indxInd], 'nu_competencia')) {
          continue
        } else if (struct.year !== 'max' && struct.year !== 'min' && struct.year !== indicators[indxInd].nu_competencia) {
          continue
        }
      }
      //            if (struct.serie && struct.serie !== indicators[indxInd].nm_serie_historica) {
      //              continue;
      //            }

      result.push(indicators[indxInd])
    }

    if (struct.combine) {
      result = result.concat(this.combineIndicators(result, struct.combine, functions))
      if (struct.slice) {
        result = this.slice(struct.slice, result)
      }
    }

    return result
  }

  isMaxOnSlice (struct, indicators, current, prop) {
    let tmpResult = current[prop]
    for (const indxInd in indicators) {
      if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
        continue
      }
      if (tmpResult === null) {
        tmpResult = indicators[indxInd][prop]
      } else if (tmpResult < indicators[indxInd][prop]) {
        tmpResult = indicators[indxInd][prop]
      }
    }
    return tmpResult == current[prop]
  }

  isMaxInYear (struct, indicators, current, prop) {
    let tmpResult = current[prop]
    for (const indxInd in indicators) {
      if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
        continue
      }
      if (indicators[indxInd].nu_competencia !== current.nu_competencia) {
        continue
      }
      if (tmpResult === null) {
        tmpResult = indicators[indxInd][prop]
      } else if (tmpResult < indicators[indxInd][prop]) {
        tmpResult = indicators[indxInd][prop]
      }
    }
    return tmpResult == current[prop]
  }

  isMinOnSlice (struct, indicators, current, prop) {
    let tmpResult = current[prop]
    for (const indxInd in indicators) {
      if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
        continue
      }
      if (tmpResult === null) {
        tmpResult = indicators[indxInd][prop]
      } else if (tmpResult > indicators[indxInd][prop]) {
        tmpResult = indicators[indxInd][prop]
      }
    }
    return tmpResult == current[prop]
  }

  isMinInYear (struct, indicators, current, prop) {
    let tmpResult = current[prop]
    for (const indxInd in indicators) {
      if (indicators[indxInd].cd_indicador !== current.cd_indicador) {
        continue
      }
      if (indicators[indxInd].nu_competencia !== current.nu_competencia) {
        continue
      }
      if (tmpResult === null) {
        tmpResult = indicators[indxInd][prop]
      } else if (tmpResult > indicators[indxInd][prop]) {
        tmpResult = indicators[indxInd][prop]
      }
    }
    return tmpResult == current[prop]
  }

  combineIndicators (sliced, struct, functions = {}, place_id_field = null) {
    const result = []
    for (const eachRow in sliced) {
      const args = []
      let addedSelf = false
      for (const indxCmb in struct) {
        const nuIndic = Object.assign({}, sliced[eachRow])
        const fnCmb = functions[struct[indxCmb].function]

        for (const indxArgs in struct[indxCmb].fn_args) {
          if (struct[indxCmb].fn_args[indxArgs].fixed != null && struct[indxCmb].fn_args[indxArgs].fixed != undefined) {
            args.push(struct[indxCmb].fn_args[indxArgs].fixed)
          } else {
            nuIndic.cd_indicador = struct[indxCmb].id
            nuIndic.ds_indicador = struct[indxCmb].desc
            nuIndic.ds_agreg_primaria = struct[indxCmb].ds_agreg_primaria
            nuIndic.ds_agreg_secundaria = struct[indxCmb].ds_agreg_secundaria
            nuIndic.ds_indicador_radical = struct[indxCmb].desc

            if (!addedSelf) {
              if (struct[indxCmb].fn_args[indxArgs].id !== undefined &&
                  struct[indxCmb].fn_args[indxArgs].id !== sliced[eachRow].cd_indicador) {
                continue
              }
              if (struct[indxCmb].year &&
                  struct[indxCmb].year !== sliced[eachRow].nu_competencia) {
                continue
              }
              addedSelf = true

              if (struct[indxCmb].fn_args[indxArgs].named_prop) {
                args.push(sliced[eachRow][struct[indxCmb].fn_args[indxArgs].named_prop])
              } else {
                args.push(sliced[eachRow].vl_indicador)
              }
            } else {
              for (const indxInd in sliced) {
                if (struct[indxCmb].fn_args[indxArgs].id !== undefined &&
                    struct[indxCmb].fn_args[indxArgs].id !== sliced[indxInd].cd_indicador) {
                  continue
                }
                if (struct[indxCmb].fn_args[indxArgs].year &&
                    struct[indxCmb].fn_args[indxArgs].year !== sliced[indxInd].nu_competencia) {
                  continue
                }
                if (place_id_field && sliced[eachRow][place_id_field] !== sliced[indxInd][place_id_field]) {
                  continue
                }
                if (struct[indxCmb].fn_args[indxArgs].named_prop) {
                  args.push(sliced[indxInd][struct[indxCmb].fn_args[indxArgs].named_prop])
                } else {
                  args.push(sliced[indxInd].vl_indicador)
                }
                break
              }
            }
          }
          // Se não encontrou arg e existe um valor default - inclui valor default
          if (args[indxArgs] == undefined && struct[indxCmb].fn_args[indxArgs].default) {
            args.push(struct[indxCmb].fn_args[indxArgs].default)
          }
        }

        if (args.length == struct[indxCmb].fn_args.length) {
          const prop = struct[indxCmb].named_prop ? struct[indxCmb].named_prop : 'vl_indicador'
          nuIndic[prop] = fnCmb.apply(null, args)

          // Verifica se já existem os registro no dataset combinado
          let found = false
          for (const indx in result) {
            if (nuIndic.cd_indicador !== result[indx].cd_indicador) {
              continue
            }
            if (nuIndic.nu_competencia !== result[indx].nu_competencia) {
              continue
            }
            if (place_id_field != null && nuIndic[place_id_field] !== result[indx][place_id_field]) {
              continue
            }
            found = true
          }
          if (!found) { result.push(nuIndic) }
        }
      }
    }

    return result
  }

  getAttributeFromIndicatorInstance (structure, functions, indicator, cbInvalidate = null) {
    let value = null
    // Pega ou calcula o valor
    if (structure && structure.function) {
      value = this.context.$objectTransformService.runNamedFunction(structure, indicator, functions)
    } else if (indicator && structure && structure.named_prop) {
      value = indicator[structure.named_prop]
    }

    // Formata o valor e inclui no array
    if (value !== null && value !== undefined && structure.format) {
      let formatRules = structure
      if (structure.format == 'auto') {
        formatRules = this.context.$textTransformService.getFormatRules(structure, indicator)
      }
      value = this.context.$numberTransformService.formatNumber(
        value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
      )
    } else if (structure && structure.required && value === null && cbInvalidate !== null) {
      cbInvalidate.apply(null)
      if (structure.default) {
        value = structure.default
      } else {
        value = 'Sem Registros'
      }
    }

    if ((value === null || value === undefined) && structure && structure.default !== null && structure.default !== undefined) {
      value = structure.default
    } else if (value == 0 && structure.zero) {
      value = structure.zero
    }

    return value
  }

  // Funções migradas de contextos de componentes (customFunctions e methods)
  calcClassIdh (idh, showIdh = false, showParentheses = false, letterCaption = true) {
    let returText = ''

    for (const level of this.idhLevels) {
      if (level.cap == null || (level.cap && idh < level.cap)) {
        returText = letterCaption ? level.name : level.name.toLowerCase()
        break
      }
    }

    returText = showParentheses ? ' (' + returText + ')' : returText
    returText = showIdh ? idh + ' ' + returText : returText

    return returText
  }

  getClassIdh (idh) {
    for (const level of this.idhLevels) {
      if (level.cap == null || (level.cap && idh < level.cap)) {
        return level.description
      }
    }
    return ''
  }

  calcProportionSalary (value, salary) {
    const fieldText = ' salários mínimos, à época'
    let proportion = value / salary

    proportion = proportion.toLocaleString('pt-br', { maximumFractionDigits: 2 })
    return proportion + fieldText
  }

  melt (dataset, value_field, layer_fields, layer_field, label_fields, label_field, value_function) {
    const meltedDS = []
    for (const indxDS in dataset) {
      // Instantiates the base object for all layers in each dataset row
      const baseNuRow = dataset[indxDS]

      // Sets layer value fields
      for (const indxLayer in layer_fields) {
        // Instantiates a new object for each layer
        const nuRow = {}
        Object.assign(nuRow, baseNuRow)
        nuRow[layer_field] = layer_fields[indxLayer]
        nuRow[label_field] = label_fields[indxLayer]

        if (value_function) {
          nuRow[value_field] = value_function(dataset[indxDS][layer_fields[indxLayer]])
        } else {
          nuRow[value_field] = dataset[indxDS][layer_fields[indxLayer]]
        }

        // Pushes each row to the resulting dataset
        meltedDS.push(nuRow)
      }
    }
    // Returns the resuting melted dataset
    return meltedDS
  }

  cast (dataset, col_fields, value_field, layer_field, fmt_value_field, det_value_field) {
    const resultDataset = []
    const newCols = []
    let key_field = ''
    if (col_fields.length == 1) {
      key_field = col_fields[0]
    } else {
      dataset.map((reg) => {
        let key_value = ''
        for (const col of col_fields) {
          key_value += reg[col].toString()
        }
        reg.reg_key = key_value
        key_field = 'reg_key'
        return reg
      })
    }
    for (const indxDS in dataset) {
      let regKey = null
      regKey = resultDataset.find(reg => reg[key_field] === dataset[indxDS][key_field])
      if (regKey) {
        // Found is true
        // Sets the new value column to the existing result row
        regKey[dataset[indxDS][layer_field]] = dataset[indxDS][value_field]
        if (!newCols.includes(dataset[indxDS][layer_field])) {
          newCols.push(dataset[indxDS][layer_field])
        }
        if (fmt_value_field) {
          regKey['fmt_' + dataset[indxDS][layer_field]] = dataset[indxDS][fmt_value_field]
        }
        if (det_value_field) {
          regKey['det_' + dataset[indxDS][layer_field]] = dataset[indxDS][det_value_field]
        }
      } else {
        // Instantiates the base object for all layers in each dataset row
        const nuRow = {}
        if (!col_fields.includes(key_field)) {
          nuRow[key_field] = dataset[indxDS][key_field]
        }
        for (const indxCol in col_fields) {
          nuRow[col_fields[indxCol]] = dataset[indxDS][col_fields[indxCol]]
        }
        // Sets the pivot value
        nuRow[dataset[indxDS][layer_field]] = dataset[indxDS][value_field]
        if (!newCols.includes(dataset[indxDS][layer_field])) {
          newCols.push(dataset[indxDS][layer_field])
        }
        if (fmt_value_field) {
          nuRow['fmt_' + dataset[indxDS][layer_field]] = dataset[indxDS][fmt_value_field]
        }
        if (det_value_field) {
          nuRow['det_' + dataset[indxDS][layer_field]] = dataset[indxDS][det_value_field]
        }
        // Adds row to the resultDataset
        resultDataset.push(nuRow)
      }
    }
    const result = {}
    result.dataset = resultDataset
    result.newCols = newCols
    return result
  }

  sortObject (object, order_field) {
    return object.sort(function (a, b) {
      if (a[order_field] > b[order_field]) {
        return 1
      }
      if (a[order_field] < b[order_field]) {
        return -1
      }
      return 0
    })
  }

  getSourceDesc (structure, dataset, metadata) {
    if (structure) {
      if (structure.source && structure.source.desc) {
        return structure.source.desc
      } else if (dataset && structure.source && structure.source.desc_field && dataset[0]) {
        return dataset[0][structure.source.desc_field] != null ? dataset[0][structure.source.desc_field] : null
      } else if (metadata && metadata.fonte) {
        return metadata.fonte
      }
    } else if (metadata && metadata.fonte) {
      return metadata.fonte
    }
    return null
  }

  getSourceLink (structure, dataset, metadata) {
    if (structure) {
      if (structure.source && structure.source.link) {
        return structure.source.link
      } else if (dataset !== null && structure.source && structure.source.link_field && dataset[0]) {
        return dataset[0][structure.source.link_field] != null ? dataset[0][structure.source.link_field] : null
      }
    } else if (metadata && metadata.link) {
      return metadata.link
    }
    return null
  }

  getAnalysisDesc (structure, dataset, metadata) {
    if (structure) {
      if (structure.analysis && structure.analysis.desc) {
        return structure.analysis.desc
      } else if (dataset && structure.analysis && structure.analysis.desc_field && dataset[0]) {
        return dataset[0][structure.analysis.desc_field] != null ? dataset[0][structure.analysis.desc_field] : null
      }
    } else if (metadata && metadata.analysis) {
      return metadata.analysis
    }
    return 'SmartLab'
  }

  getAnalysisLink (structure, dataset, metadata) {
    if (structure) {
      if (structure.analysis && structure.analysis.link) {
        return structure.analysis.link
      } else if (dataset !== null && structure.analysis && structure.analysis.link_field && dataset[0]) {
        return dataset[0][structure.analysis.link_field] != null ? dataset[0][structure.analysis.link_field] : null
      }
    } else if (metadata && metadata.analyis && metadata.analysis.link) {
      return metadata.analysis.link
    }
    return null
  }

  getMinMax (dataset, value_field) {
    // Obtém o min e o max
    let min; let max = null
    for (const indxDS in dataset) {
      if (min == null || min > parseFloat(dataset[indxDS][value_field])) {
        min = parseFloat(dataset[indxDS][value_field])
      }
      if (max == null || max < parseFloat(dataset[indxDS][value_field])) {
        max = parseFloat(dataset[indxDS][value_field])
      }
    }
    return [min, max]
  }

  getMinMaxEachIndicator (dataset, value_field) {
    // Obtém o min e o max
    const min = []
    const max = []
    for (const indxDS in dataset) {
      if (this.isMinInYear({}, dataset, dataset[indxDS], value_field)) {
        min.push(dataset[indxDS])
      }
      if (this.isMaxInYear({}, dataset, dataset[indxDS], value_field)) {
        max.push(dataset[indxDS])
      }
    }

    // Itera no dataset, incluindo os atributos minVal e maxVal
    for (const indxDS in dataset) {
      // Atribui o minimo
      for (const indxMin in min) {
        if (dataset[indxDS].cd_indicador !== min[indxMin].cd_indicador) {
          continue
        }
        if (dataset[indxDS].nu_competencia !== min[indxMin].nu_competencia) {
          continue
        }
        dataset[indxDS].minVal = min[indxMin][value_field]
        break
      }
      // Atribui o maximo
      for (const indxMax in max) {
        if (dataset[indxDS].cd_indicador !== max[indxMax].cd_indicador) {
          continue
        }
        if (dataset[indxDS].nu_competencia !== max[indxMax].nu_competencia) {
          continue
        }
        dataset[indxDS].maxVal = max[indxMax][value_field]
        break
      }
    }
    // Retorna o dataset preenchido
    return dataset
  }

  getGlobalDatasets () { return this.globalDatasets }

  getGlobalDataset (dataset, scope, auId = null, suffix = '') {
    const datasetSuffix = dataset + suffix
    if (this.globalDatasets[datasetSuffix] == null || this.globalDatasets[datasetSuffix] == undefined ||
        this.globalDatasets[datasetSuffix].analysisUnit == null || this.globalDatasets[datasetSuffix].analysisUnit == undefined ||
        this.globalDatasets[datasetSuffix].analysisUnit.type != scope || this.globalDatasets[datasetSuffix].analysisUnit.id != auId
    ) {
      return this.setGlobalDataset(dataset, scope, auId, suffix)
    } else {
      return this.globalDatasets[datasetSuffix]
    }
  }

  setGlobalDataset (dataset_name, scope, auId = null, suffix = '') {
    const url = this.context.$textTransformService.replaceArgs(this.datasetEndpoints[dataset_name][scope], [auId])
    // busca indicadores da localidade
    return axios(this.context.$axiosCallSetupService.getAxiosOptions(url))
      .then((result) => {
        const dataset = { name: dataset_name, ds: result.data.dataset, valid: true, analysisUnit: { type: scope, id: auId } }
        this.globalDatasets[dataset_name + suffix] = dataset
        return dataset
      })
  }

  getMultipleGlobalDatasets (thematicDatasets, scope, auId, suffix = '') {
    const promises = []
    const colDatasets = {}

    for (const indxDS in thematicDatasets) {
      const tmpDataset = this.getGlobalDataset(thematicDatasets[indxDS], scope, auId, suffix)

      if (tmpDataset instanceof Promise || tmpDataset.then) {
        promises.push(tmpDataset)
      } else {
        colDatasets[thematicDatasets[indxDS] + suffix] = tmpDataset
      }
    }

    return Promise.all(promises)
      .then((results) => {
        for (const result of results) {
          colDatasets[result.name] = result
        }
        return colDatasets
      })
  }
}
