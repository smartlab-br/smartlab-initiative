// import DateFormatService from './dateFormatService.js'
// import NumberTransformService from './numberTransformService'
// import TextTransformService from './textTransformService'
// import IndicatorsModel from '../../model/singleton/indicatorsModel'

export class ObjectTransformService {
  constructor (context) {
    this.context = context
  }

  runNamedFunction (struct, base_object, localFunctions = null, initialArgs = [], customParams = {}) {
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

    if (localFunctions && localFunctions[struct.function]) {
      // Checks if the function exist in the localFunctions argument
      return localFunctions[struct.function].apply(null, args)
    }
    if (['formatDate', 'getWeekDay'].includes(struct.function)) {
      return this.context.$dateFormatService[struct.function].apply(this.context.$dateFormatService, args)
    }
    if (['calcClassIdh', 'getClassIdh', 'calcProportionSalary'].includes(struct.function)) {
      const model = this.context.$indicatorsModel
      return model[struct.function].apply(model, args)
    }
    if (['calcIndexPercentage', 'calcDeltaPercentage', 'getAbsoluteValue', 'getPaceString'].includes(struct.function)) {
      return this.context.$numberTransformService[struct.function].apply(null, args)
    }
    if (['applyInterpolReplaceDatasetParam'].includes(struct.function)) {
      args.push(localFunctions)
      args.push(customParams)
      return this.context.$textTransformService[struct.function].apply(this.context.$textTransformService, args)
    }
    if (this[struct.function]) {
      return this[struct.function].apply(null, args)
    }

    // Returns null otherwise
    return null
  }

  valueCheck (value, baseValue = 0, returnTextInCaseOfHigherThanBaseValue = '', returnTextInCaseOfLowerThanBaseValue = '') {
    return value > baseValue ? returnTextInCaseOfHigherThanBaseValue : returnTextInCaseOfLowerThanBaseValue
  }
}
