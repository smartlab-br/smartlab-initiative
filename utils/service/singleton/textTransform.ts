import { Indicators } from "./../../model/indicators"
import { NumberTransformService } from "./numberTransform"
import { ObjectTransformService } from "./objectTransform"

export class TextTransformService {
  // Adicionando uma assinatura de índice para permitir acesso dinâmico
  [index: string]: (...args: any[]) => void

  applyInterpol(structure: any, customParams: any = {}, base_object: any = null, cbInvalidate: any = null) {
    const objectTransformService = new ObjectTransformService()
    const numberTransformService = new NumberTransformService()

    if (structure !== null && structure !== undefined) {
      let arrayStruct: any[] = []
      const returnStruct: any[] = []
      if (!Array.isArray(structure)) {
        arrayStruct.push(structure)
      } else {
        arrayStruct = structure
      }

      for (const struct of arrayStruct) {
        if (struct.fixed !== null && struct.fixed !== undefined) {
          returnStruct.push(struct.fixed)
          continue
        }
        const tmplt = struct.template
        const args: any[] = []
        for (const indx in struct.args) {
          let iterArg = null
          if (struct.args[indx].function) {
            if (struct.args[indx].base_object && customParams[struct.args[indx].base_object]) {
              iterArg = objectTransformService.runNamedFunction(struct.args[indx], customParams)
            } else {
              iterArg = objectTransformService.runNamedFunction(struct.args[indx], base_object)
            }
          } else if (struct.args[indx].value) {
            iterArg = struct.args[indx].value
          } else if (struct.args[indx].fixed) {
            iterArg = struct.args[indx].fixed
          } else if (Array.isArray(base_object) && struct.args[indx].id) {
            iterArg = (new Indicators()).getIndicatorValueFromStructure(struct.args[indx], null, base_object)
            args.push(iterArg)
            continue
          } else if (struct.args[indx].named_prop) {
            if (base_object) {
              iterArg = base_object[struct.args[indx].named_prop]
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
            iterArg = "<a href='" + struct.args[indx].link + "'>" + struct.args[indx].text + "</a>"
          }

          if (iterArg != null) {
            if (struct.args[indx].format) {
              let formatRules = struct.args[indx]
              if (struct.args[indx].format == "auto") {
                formatRules = this.getFormatRules(struct.args[indx], iterArg)
              }
              iterArg = numberTransformService.formatNumber(
                iterArg,
                formatRules.format,
                formatRules.precision,
                formatRules.multiplier,
                formatRules.collapse,
                formatRules.signed,
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
        returnStruct.push(this.replaceArgs(tmplt, args))
      }
      if (returnStruct.length == 1) {
        return returnStruct[0]
      } else {
        return returnStruct
      }
    }
    return ""
  }

  getFormatRules(structure: any, indicator: any = null) {
    const formatRules = structure
    const autoType = indicator.ds_indicador_prefixo

    // Verifica a precisão
    if (structure.precision == null || structure.precision == undefined) {
      if (autoType == "(Índice)") {
        formatRules.precision = 3
      }
    }

    // Verifica o multiplicador
    if (structure.multiplier == null || structure.multiplier == undefined) {
      if (autoType == "(em R$ x 1.000)") {
        formatRules.multiplier = 1000
      }
    }

    // Verifica o collapse
    // Todo collapse seguirá o default do format, exceto quando expressamente definido

    // Verifica o default
    if (structure.default == null || structure.default == undefined) {
      // Todo default será Sem Registros, salvo expresso no yaml
      formatRules.default = "Sem Registros"
    }

    // Verifica o tipo da formatação
    if (autoType == "(em R$ x 1.000)" || autoType == "(R$)") {
      formatRules.format = "monetario"
    } else if (autoType == "(Índice)") {
      formatRules.format = "real"
    } else if (autoType == "(Percentual)") {
      formatRules.format = "porcentagem"
    }

    //verifica se as tags de UI devem ser geradas na formatação
    if (structure.uiTags == null || structure.uiTags == undefined) {
      formatRules.uiTags = true
    }

    return formatRules
  }

  // Reposiciona os parâmetros, uma vez que recebe automaticamente um row do dataset como primeiro
  applyInterpolReplaceDatasetParam(
    dataset_object: any,
    struct: any,
    customParams: any = {},
    cbInvalidate: any = null) {
    return this.applyInterpol(struct, customParams, dataset_object, cbInvalidate)
  }

  replaceArgs(strInput: string | null, args: any[] | null) {
    if (!strInput) return ""
    let result: string = strInput
    if (args){
      for (let i = 0; i < args.length; i++) {
        const reg = new RegExp("\\{" + i + "\\}", "gm")
        result = result.replace(reg, args[i])
      }
    }
    return result
  }

  replaceSpecialCharacters(strInput: string) {
    let result: string = strInput
    result = result.replace(/[áàâãä]/g, "a")
    result = result.replace(/[ÁÀÂÃÄ]/g, "A")
    result = result.replace(/[éèê]/g, "e")
    result = result.replace(/[ÉÈÊ]/g, "E")
    result = result.replace(/[íì]/g, "i")
    result = result.replace(/[ÍÌ]/g, "I")
    result = result.replace(/[óòôõö]/g, "o")
    result = result.replace(/[ÓÒÔÕÖ]/g, "O")
    result = result.replace(/[úùü]/g, "u")
    result = result.replace(/[ÚÙÜ]/g, "U")
    result = result.replace(/ç/g, "c")
    result = result.replace(/Ç/g, "C")
    return result
  }
  
}