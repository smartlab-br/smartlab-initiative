
import { IDH } from "~/utils/model/idh"
import { DateFormatService } from "./dateFormat"
import { NumberTransformService } from "./numberTransform"
import { TextTransformService } from "./textTransform"

export class ObjectTransformService {
  // Adicionando uma assinatura de índice para permitir acesso dinâmico
  [index: string]: (...args: any[]) => void

  runNamedFunction(struct: any, base_object: any, localFunctions: any = null, initialArgs: any[] = [], customParams: any = {}) {
    // Runs function with args defines in yaml structure
    const args = initialArgs

    for (const indx in struct.fn_args) {
      // Gets the args for the yaml-defined function
      if (struct.fn_args[indx].fixed != null && struct.fn_args[indx].fixed != undefined) {
        // Apply fized value to arg
        args.push(struct.fn_args[indx].fixed)
      } else if (struct.fn_args[indx].named_prop) {
        if (base_object) {
          if (struct.fn_args[indx].base_object) {
            if (customParams && customParams[struct.fn_args[indx].base_object]) {
              args.push(customParams[struct.fn_args[indx].base_object][struct.fn_args[indx].named_prop])
            } else if (base_object[struct.fn_args[indx].base_object]) {
              args.push(base_object[struct.fn_args[indx].base_object][struct.fn_args[indx].named_prop])
            } else {
              args.push(undefined)
            }
          } else {
            args.push(base_object[struct.fn_args[indx].named_prop])
          }
        } else {
          args.push(undefined)
        }
      } else if (struct.fn_args[indx].function) {
        // If arg has an internal function defined with args, apply it
        args.push(this.runNamedFunction(struct.fn_args[indx], base_object, localFunctions))
      }
    }

    const funcName: string = struct.function
    if (localFunctions && localFunctions[funcName]) {
      // Checks if the function exist in the localFunctions argument
      return localFunctions[funcName].apply(null, args)
    }
    if (["formatDate", "getWeekDay"].includes(funcName)) {
      const dateFormatService = new DateFormatService()
      return dateFormatService[funcName](...args)
    }
    if (["calcClassIdh", "getClassIdh"].includes(struct.function)) {
      const idh = new IDH()
      return idh[funcName](...args)
    }
    if (["calcIndexPercentage", "calcDeltaPercentage", "getAbsoluteValue", "getPaceString", "calcProportionSalary"].includes(struct.function)) {
      const numberTransformService = new NumberTransformService()
      return numberTransformService[funcName](...args)
    }
    if (["applyInterpolReplaceDatasetParam"].includes(struct.function)) {
      args.push(localFunctions)
      args.push(customParams)
      const textTransformService = new TextTransformService()
      return textTransformService[struct.function](...args)
    }
    if (this[struct.function]) {
      return this[struct.function](...args)
    }

    // Returns null otherwise
    return null
  }

  valueCheck (value: number, baseValue: number = 0, returnTextInCaseOfHigherThanBaseValue: string = "", returnTextInCaseOfLowerThanBaseValue: string = "") {
    return value > baseValue ? returnTextInCaseOfHigherThanBaseValue : returnTextInCaseOfLowerThanBaseValue
  }
}
