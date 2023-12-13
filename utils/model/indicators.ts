import { TextTransformService } from "../service/singleton/textTransform"
import { UrlTransformService } from "../service/singleton/urlTransform"
import { NumberTransformService } from "../service/singleton/numberTransform"
import { ObjectTransformService } from "../service/singleton/objectTransform"

interface DictDatasetEndpoints {
  [key: string]: {
    estado: string
    brasil: string
    municipio: string
    mptreg: string
    prtptm: string
  }
}

export class Indicators {
  loadStatus: string | null = null

  datasetEndpoints: DictDatasetEndpoints = {
    centralindicadores: {
      municipio: "/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,nm_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge,ds_fonte,vl_indicador,vl_indicador_txt,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT",
      estado: "/indicadoresestaduais?categorias=nm_uf,cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_mun_ibge,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_uf_total,pct_br,media_br&filtros=eq-cd_mun_ibge-{0}&agregacao=DISTINCT",
      brasil: "/indicadoresnacionais?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,ds_fonte,vl_indicador,vl_indicador_txt&agregacao=DISTINCT",
      mptreg: "/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_prt,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_prt-{0}&agregacao=DISTINCT",
      prtptm: "/indicadoresmptunidades?categorias=cd_dimensao,ds_indicador,ds_indicador_curto,ds_indicador_completo,ds_indicador_prefixo,ds_agreg_primaria,ds_agreg_secundaria,ds_indicador_radical,cd_indicador,nu_competencia,nu_competencia_max,nu_competencia_min,cd_unidade,cd_prt,nm_unidade,sg_unidade,ds_fonte,vl_indicador,vl_indicador_txt,vl_indicador_br,rank_br,rank_br_total,rank_prt_total,pct_br,media_br&filtros=eq-cd_unidade-{0}&agregacao=DISTINCT"
    },
    trabalho_escravo: {
      municipio: "/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv,vl_indicador,rank_uf,rank_br,rank_uf_total,rank_br_total,pct_uf,pct_br,media_uf,media_br,vl_indicador_br,vl_indicador_uf&filtros=eq-cd_mun_ibge_dv-{0},and,nn-vl_indicador&agregacao=DISTINCT",
      estado: "/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador,rank_br,rank_br_total,pct_br,media_br,vl_indicador_br&filtros=eq-cd_uf-{0},and,nn-vl_indicador&agregacao=DISTINCT",
      brasil: "/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia,nu_competencia_min,nu_competencia_max,vl_indicador&agregacao=DISTINCT&filtros=nn-vl_indicador",
      mptreg: "",
      prtptm: ""
    },
    trabalho_escravo_agr: {
      municipio: "/te/indicadoresmunicipais?categorias=nm_municipio_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max,cd_mun_ibge_dv&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_mun_ibge_dv-{0},and,nn-vl_indicador",
      estado: "/te/indicadoresestaduais?categorias=nm_uf,cd_uf,cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM&filtros=eq-cd_uf-{0},and,nn-vl_indicador",
      brasil: "/te/indicadoresnacionais?categorias=cd_indicador,nu_competencia_min,nu_competencia_max&valor=vl_indicador&agregacao=SUM&filtros=nn-vl_indicador",
      mptreg: "",
      prtptm: ""
    },
    munic: {
      municipio: "/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,total_uf,presenca_total_uf,pct_presenca_uf,nm_municipio,nm_uf,sg_uf,nm_municipio_uf&filtros=eq-cd_mun_ibge-{0}",
      estado: "/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,total_uf,presenca_total_uf,pct_presenca_uf,rank_pct_uf,rank_pct_uf_max,nm_municipio,nm_uf,sg_uf,nm_municipio_uf&valor=cd_uf&agregacao=DISTINCT&filtros=eq-cd_uf-{0}",
      brasil: "/estadicmunic?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,nu_ano_indicador-nu_competencia,tema,sub_tema,ds_indicador,ds_fonte,presenca_total_br,total_br,pct_presenca_br,spai_ds_texto&valor=cd_indicador_spai&agregacao=DISTINCT",
      mptreg: "",
      prtptm: ""
    },
    estadic: {
      municipio: "",
      estado: "/estadicuf?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,ds_fonte,nu_ano_indicador-nu_competencia,vl_indicador,spai_vl_indicador_txt,ds_indicador,tema,sub_tema,spai_vl_indicador,total_br,presenca_total_br,pct_presenca_br,nm_uf,sg_uf&filtros=eq-cd_uf-{0}",
      brasil: "/estadicuf?categorias=cd_indicador_spai-cd_indicador,cd_indicador-cd_indicador_externo,spai_ds,spai_ds_texto,tema,ds_indicador,ds_fonte,sub_tema,presenca_total_br,pct_presenca_br,nu_ano_indicador-nu_competencia&agregacao=DISTINCT",
      mptreg: "",
      prtptm: ""
    }
  }

  globalDatasets: any = {}

  // options: {
  //   id: string,
  //   label: string,
  //   detail: string,
  //   to: string,
  //   icon: string,
  //   type: string,
  //   context: string
  // }[] = []
  // getOptions () {
  //   return this.options
  // }

  // buildIndicatorsOptions (observatory: string | null = null) {
  //   this.loadStatus = "LOADING"

  //   // O default é o TD
  //   let url = "/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct"
  //   if (observatory && observatory != "td") {
  //     url = "/" + observatory + "te/indicadoresmunicipais?categorias=ds_indicador,ds_indicador_radical,cd_indicador,ds_fonte&agregacao=distinct"
  //   }

  //   return this.context.$axios(this.context.$axiosCallSetupService.getAxiosOptions(url))
  //     .then((result) => {
  //       const todosIndicadores = result.data.dataset

  //       for (let i = 0; i < todosIndicadores.length; i++) {
  //         const dim = context.findDimensionById(todosIndicadores[i].cd_dimensao)
  //         /*
  //         pusher({
  //           id: todosIndicadores[i].nm_indicador,
  //           label: todosIndicadores[i].ds_indicador_radical,
  //           detail: "Mapa",
  //           to: "/mapa/" + todosIndicadores[i].nm_indicador + "?type=topo&agregacao=mesorregiao",
  //           icon: "map", type: "map"
  //         });
  //         */
  //         this.options.push({
  //           id: todosIndicadores[i].cd_indicador,
  //           label: todosIndicadores[i].ds_indicador_radical,
  //           detail: "Indicador, " + dim.label,
  //           to: "/localidade/0?dimensao=" + dim.id,
  //           icon: "dashboard",
  //           type: "indicator",
  //           context: "sim"
  //         })
  //       }

  //       this.loadStatus = "SUCCESS"
  //       return this.options
  //     }, (error) => {
  //       this.loadStatus = "ERROR"
  //       Promise.reject(error)
  //     })
  // }

  indicatorsToValueArray (args: any, functions: any, indicators: any, cbInvalidate:any | null = null) {
    let values: any[] = []
    for (const indx in args) {
      if (args[indx].id) {
        values = values.concat(this.getIndicatorValueFromStructure(args[indx], functions, indicators, cbInvalidate))
      } else if (args[indx].link) {
        values.push("<a href='" + args[indx].link + "'>" + args[indx].text + "</a>")
      } else {
        values.push(this.getAttributeFromIndicatorInstance(args[indx], functions, indicators[0], cbInvalidate))
      }
    }
    return values
  }

  getIndicatorValueFromStructure (structure: any, functions: any, indicators: any, cbInvalidate:any | null = null) {
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

  slice (struct: any, indicators: any, functions = {}): any {
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
        if (struct.year === "max" && !this.isMaxOnSlice(indicators, indicators[indxInd], "nu_competencia")) {
          continue
        } else if (struct.year === "min" && !this.isMinOnSlice(indicators, indicators[indxInd], "nu_competencia")) {
          continue
        } else if (struct.year !== "max" && struct.year !== "min" && struct.year !== indicators[indxInd].nu_competencia) {
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

  isMaxOnSlice (indicators: any, current: any, prop: string) {
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

  isMaxInYear (indicators: any, current: any, prop: string) {
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

  isMinOnSlice (indicators: any, current: any, prop: string) {
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

  isMinInYear (indicators: any, current: any, prop: string) {
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

  combineIndicators (sliced: any[], struct: any, functions = {}, place_id_field:string | null = null) {
    const result = []
    for (const indxCmb in struct) {
      const fnCmb = functions[struct[indxCmb].function as keyof typeof functions] as Function
      let iLoop = 1
      let uniquePlaces: any[] = []
      if (place_id_field) {
        uniquePlaces = sliced.map(item => item[place_id_field])
          .filter(
            (value, index, current_value) => current_value.indexOf(value) === index
          )
        iLoop = uniquePlaces.length
      }

      for (let i = 0; i < iLoop; i++) {
        let regIndicadorBase = []
        if (place_id_field) {
          regIndicadorBase = sliced.find(el => el[place_id_field] === uniquePlaces[i])
        } else {
          regIndicadorBase = sliced[0]
        }
        const nuIndic = Object.assign({}, regIndicadorBase)
        nuIndic.cd_indicador = struct[indxCmb].id
        nuIndic.ds_indicador = struct[indxCmb].desc
        nuIndic.ds_agreg_primaria = struct[indxCmb].ds_agreg_primaria
        nuIndic.ds_agreg_secundaria = struct[indxCmb].ds_agreg_secundaria
        nuIndic.ds_indicador_radical = struct[indxCmb].desc
        nuIndic.vl_indicador = null

        const args = []
        for (const indxArgs in struct[indxCmb].fn_args) {
          if (struct[indxCmb].fn_args[indxArgs].fixed !== null && struct[indxCmb].fn_args[indxArgs].fixed !== undefined) {
            args.push(struct[indxCmb].fn_args[indxArgs].fixed)
          } else {
            const argColumn = struct[indxCmb].fn_args[indxArgs].named_prop ? struct[indxCmb].fn_args[indxArgs].named_prop : "vl_indicador"
            const regFiltered = sliced.find(function (el) {
              let returnValue = false
              returnValue = struct[indxCmb].fn_args[indxArgs].id === el.cd_indicador
              if (struct[indxCmb].fn_args[indxArgs].year) {
                returnValue = returnValue && struct[indxCmb].fn_args[indxArgs].year === el.nu_competencia
              }
              if (place_id_field) {
                returnValue = returnValue && uniquePlaces[i] === el[place_id_field]
              }
              return returnValue
            })
            let argValue = null
            if (regFiltered) {
              argValue = regFiltered[argColumn]
            }

            // Se não encontrou arg e existe um valor default - inclui valor default
            if (!argValue && struct[indxCmb].fn_args[indxArgs].default !== undefined) {
              argValue = struct[indxCmb].fn_args[indxArgs].default
            }
            args.push(argValue)
          }
        }
        const prop = struct[indxCmb].named_prop ? struct[indxCmb].named_prop : "vl_indicador"
        if (args.length === struct[indxCmb].fn_args.length) {
          nuIndic[prop] = fnCmb(...args)
          result.push(nuIndic)
        }
      }
    }

    return result
  }

  getAttributeFromIndicatorInstance (structure: any, functions: any, indicator: any, cbInvalidate: any | null = null) {
    const objectTransformService = new ObjectTransformService()
    const textTransformService = new TextTransformService()
    const numberTransformService = new NumberTransformService()

    let value = null
    // Pega ou calcula o valor
    if (structure && structure.function) {
      value = objectTransformService.runNamedFunction(structure, indicator, functions)
    } else if (indicator && structure && structure.named_prop) {
      value = indicator[structure.named_prop]
    }

    // Formata o valor e inclui no array
    if (value !== null && value !== undefined && structure.format) {
      let formatRules = structure
      if (structure.format == "auto") {
        formatRules = textTransformService.getFormatRules(structure, indicator)
      }
      value = numberTransformService.formatNumber(
        value, formatRules.format, formatRules.precision, formatRules.multiplier, formatRules.collapse, formatRules.signed, formatRules.uiTags
      )
    } else if (structure && structure.required && value === null && cbInvalidate !== null) {
      cbInvalidate.apply(null)
      if (structure.default) {
        value = structure.default
      } else {
        value = "Sem Registros"
      }
    }

    if ((value === null || value === undefined) && structure && structure.default !== null && structure.default !== undefined) {
      value = structure.default
    } else if (value == 0 && structure.zero) {
      value = structure.zero
    }

    return value
  }

  melt (dataset: any[], value_field: string, layer_fields: string[], layer_field: string, label_fields: string[], label_field:string, value_function: Function | null) {
    const meltedDS = []
    for (const indxDS in dataset) {
      // Instantiates the base object for all layers in each dataset row
      const baseNuRow = dataset[indxDS]

      // Sets layer value fields
      for (const indxLayer in layer_fields) {
        // Instantiates a new object for each layer
        const nuRow: any = {}
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

  cast (dataset: any[], col_fields: string[], value_field: string, layer_field: string, fmt_value_field: string, det_value_field: string) {
    const resultDataset: any[] = []
    const newCols: any[] = []
    let key_field = ""
    if (col_fields.length == 1) {
      key_field = col_fields[0]
    } else {
      dataset.map((reg) => {
        let key_value = ""
        for (const col of col_fields) {
          key_value += reg[col].toString()
        }
        reg.reg_key = key_value
        key_field = "reg_key"
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
          regKey["fmt_" + dataset[indxDS][layer_field]] = dataset[indxDS][fmt_value_field]
        }
        if (det_value_field) {
          regKey["det_" + dataset[indxDS][layer_field]] = dataset[indxDS][det_value_field]
        }
      } else {
        // Instantiates the base object for all layers in each dataset row
        const nuRow: any = {}
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
          nuRow["fmt_" + dataset[indxDS][layer_field]] = dataset[indxDS][fmt_value_field]
        }
        if (det_value_field) {
          nuRow["det_" + dataset[indxDS][layer_field]] = dataset[indxDS][det_value_field]
        }
        // Adds row to the resultDataset
        resultDataset.push(nuRow)
      }
    }
    const result: any = {}
    result.dataset = resultDataset
    result.newCols = newCols
    return result
  }

  sortObject (object: any[], order_field: string, order: string = "asc") {
    const orderModifier = (order === "desc" ? -1 : 1)
    return object.sort(function (a, b) {
      if (a[order_field] > b[order_field]) {
        return orderModifier * 1
      }
      if (a[order_field] < b[order_field]) {
        return orderModifier * -1
      }
      return 0
    })
  }

  getSourceDesc (structure: any, dataset: any[], metadata: any) {
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

  getSourceLink (structure: any, dataset: any[], metadata: any) {
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

  getAnalysisDesc (structure: any, dataset: any[], metadata: any) {
    if (structure) {
      if (structure.analysis && structure.analysis.hide_analysis) {
        return null
      } else if (structure.analysis && structure.analysis.desc) {
        return structure.analysis.desc
      } else if (dataset && structure.analysis && structure.analysis.desc_field && dataset[0]) {
        return dataset[0][structure.analysis.desc_field] != null ? dataset[0][structure.analysis.desc_field] : null
      }
    } else if (metadata && metadata.analysis) {
      return metadata.analysis
    }
    return "SmartLab"
  }

  getAnalysisLink (structure: any, dataset: any[], metadata: any) {
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

  getMinMax (dataset: any[], value_field: string) {
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

  getMinMaxEachIndicator (dataset: any[], value_field: string) {
    // Obtém o min e o max
    const min = []
    const max = []
    for (const indxDS in dataset) {
      if (this.isMinInYear(dataset, dataset[indxDS], value_field)) {
        min.push(dataset[indxDS])
      }
      if (this.isMaxInYear(dataset, dataset[indxDS], value_field)) {
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

  getGlobalDataset (dataset: string, scope: string, auId:string | null = null, suffix: string = "") {
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

  async setGlobalDataset (dataset_name: string, scope: string, auId: string | null = null, suffix: string = "") {
    const textTransformService = new TextTransformService()
    const endpoints = this.datasetEndpoints[dataset_name]
    let url: string = ""
    if (auId){
      url = textTransformService.replaceArgs(endpoints[scope as keyof typeof endpoints], [auId])
    }
    // busca indicadores da localidade
    const result: any = await $fetch(UrlTransformService.getApiUrl(url))
    const dataset = { name: dataset_name, ds: result.data.dataset, valid: true, analysisUnit: { type: scope, id: auId } }
    this.globalDatasets[dataset_name + suffix] = dataset
    return dataset
  }

  getMultipleGlobalDatasets (thematicDatasets: string[], scope: string, auId: string, suffix: string = "") {
    const promises: any = []
    const colDatasets: any = {}

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