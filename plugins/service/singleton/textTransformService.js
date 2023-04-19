// import NumberTransformService from './numberTransformService.js'
// import ObjectTransformService from './objectTransformService.js'
// import IndicatorsModel from '../../model/singleton/indicatorsModel.js';

export class TextTransformService {
  constructor (context) {
    this.context = context
  }

  applyInterpol (structure, customParams = {}, customFunctions = [], base_object = null, cbInvalidate = null) {
    if (structure !== null && structure !== undefined) {
      let arrayStruct = []
      const returnStruct = []
      if (!Array.isArray(structure)) {
        arrayStruct[0] = structure
      } else {
        arrayStruct = structure
      }

      for (const struct of arrayStruct) {
        if (struct.fixed !== null && struct.fixed !== undefined) {
          returnStruct.push(struct.fixed)
          continue
        }
        const tmplt = struct.template
        const args = []
        for (const indx in struct.args) {
          let iterArg = null
          if (struct.args[indx].function) {
            if (struct.args[indx].base_object && customParams[struct.args[indx].base_object]) {
              iterArg = this.context.$objectTransformService.runNamedFunction(struct.args[indx], customParams, customFunctions)
            } else {
              iterArg = this.context.$objectTransformService.runNamedFunction(struct.args[indx], base_object, customFunctions)
            }
          } else if (struct.args[indx].value) {
            iterArg = struct.args[indx].value
          } else if (struct.args[indx].fixed) {
            iterArg = struct.args[indx].fixed
          } else if (Array.isArray(base_object) && struct.args[indx].id) {
            iterArg = this.context.$indicatorsModel.getIndicatorValueFromStructure(struct.args[indx], null, base_object)
            args.push(iterArg)
            continue
          } else if (struct.args[indx].named_prop) {
            if (base_object) {
              if (!Array.isArray(base_object)) {
                iterArg = base_object[struct.args[indx].named_prop]
              } else if (base_object.length > 0) {
                iterArg = base_object[0][struct.args[indx].named_prop]
              }
            }
            if (iterArg === null || iterArg === undefined) {
              if (struct.args[indx].base_object) {
                if (customParams[struct.args[indx].base_object]) {
                  iterArg = customParams[struct.args[indx].base_object][struct.args[indx].named_prop]
                } else if (base_object[struct.args[indx].base_object]) {
                  iterArg = base_object[struct.args[indx].base_object][struct.args[indx].named_prop]
                }
              } else {
                iterArg = customParams[struct.args[indx].named_prop]
              }
            }
          } else if (struct.args[indx].link) {
            iterArg = "<a href='" + struct.args[indx].link + "'>" + struct.args[indx].text + '</a>'
          }

          if (iterArg != null) {
            if (struct.args[indx].format) {
              let formatRules = struct.args[indx]
              if (struct.args[indx].format == 'auto') {
                formatRules = this.getFormatRules(struct.args[indx], iterArg)
              }
              iterArg = this.context.$numberTransformService.formatNumber(
                iterArg, formatRules.format, formatRules.precision,
                formatRules.multiplier, formatRules.collapse, formatRules.signed,
                formatRules.uiTags
              )
            }
            args.push(iterArg)
          } else if (struct.args[indx].required && cbInvalidate !== null) {
            cbInvalidate.apply(null)
          } else {
            args.push(struct.args[indx].default)
          }
        }
        returnStruct.push(this.replaceArgs(tmplt, args, cbInvalidate))
      }
      if (returnStruct.length == 1) {
        return returnStruct[0]
      } else {
        return returnStruct
      }
    }
    return ''
  }

  getFormatRules (structure, indicator = null) {
    const formatRules = structure
    const autoType = indicator.ds_indicador_prefixo

    // Verifica a precisão
    if (structure.precision == null || structure.precision == undefined) {
      if (autoType == '(Índice)') {
        formatRules.precision = 3
      }
    }

    // Verifica o multiplicador
    if (structure.multiplier == null || structure.multiplier == undefined) {
      if (autoType == '(em R$ x 1.000)') {
        formatRules.multiplier = 1000
      }
    }

    // Verifica o collapse
    // Todo collapse seguirá o default do format, exceto quando expressamente definido

    // Verifica o default
    if (structure.default == null || structure.default == undefined) {
      // Todo default será Sem Registros, salvo expresso no yaml
      formatRules.default = 'Sem Registros'
    }

    // Verifica o tipo da formatação
    if (autoType == '(em R$ x 1.000)' || autoType == '(R$)') {
      formatRules.format = 'monetario'
    } else if (autoType == '(Índice)') {
      formatRules.format = 'real'
    } else if (autoType == '(Percentual)') {
      formatRules.format = 'porcentagem'
    }

    // verifica se as tags de UI devem ser geradas na formatação
    if (structure.uiTags == null || structure.uiTags == undefined) {
      formatRules.uiTags = true
    }

    return formatRules
  }

  // Reposiciona os parâmetros, uma vez que recebe automaticamente um row do dataset como primeiro
  applyInterpolReplaceDatasetParam (dataset_object, struct, customFunctions = [], customParams = {}, cbInvalidate = null) {
    return this.applyInterpol(struct, customParams, customFunctions, dataset_object, cbInvalidate)
  }

  replaceArgs (string, args, cbInvalidate = null) {
    if (string === null || string === undefined) {
      return ''
    }
    for (let i = 0; i < args.length; i++) {
      const reg = new RegExp('\\{' + i + '\\}', 'gm')
      string = string.replace(reg, args[i])
    }
    return string
  }

  replaceSpecialCharacters (string) {
    string = string.replace(/[áàâãä]/g, 'a')
    string = string.replace(/[ÁÀÂÃÄ]/g, 'A')
    string = string.replace(/[éèê]/g, 'e')
    string = string.replace(/[ÉÈÊ]/g, 'E')
    string = string.replace(/[íì]/g, 'i')
    string = string.replace(/[ÍÌ]/g, 'I')
    string = string.replace(/[óòôõö]/g, 'o')
    string = string.replace(/[ÓÒÔÕÖ]/g, 'O')
    string = string.replace(/[úùü]/g, 'u')
    string = string.replace(/[ÚÙÜ]/g, 'U')
    string = string.replace(/ç/g, 'c')
    string = string.replace(/Ç/g, 'C')
    return string
  }
}
