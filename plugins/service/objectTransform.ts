import { DateFormatService } from "plugins/service/dateFormat"
import { NumberTransformService } from "plugins/service/numberTransform"
import { TextTransformService } from "plugins/service/textTransform"

interface IFunctionArgument {
  fixed?: string
  named_prop?: string
  base_object?: string
  function?: string
}
class ObjectTransformService {
  constructor() {}

  static runNamedFunction(struct: any, base_object: any, localFunctions: any = null, initialArgs: any[] = [], customParams: any = {}) {
    // Runs function with args defines in yaml structure
    var args = initialArgs;
    
    for (var fn_arg of struct.fn_args as IFunctionArgument[]) {
      // Gets the args for the yaml-defined function
      if (fn_arg.fixed != null && fn_arg.fixed != undefined) {
        // Apply fized value to arg
        args.push(fn_arg.fixed);
      } else if (fn_arg.named_prop) {
        if (base_object) {
          if(fn_arg.base_object){
            if (customParams && customParams[fn_arg.base_object]){
              args.push(customParams[fn_arg.base_object][fn_arg.named_prop]);
            } else if (base_object[fn_arg.base_object]){
              args.push(base_object[fn_arg.base_object][fn_arg.named_prop]);
            } else {
              args.push(undefined);
            }
          } else {
            args.push(base_object[fn_arg.named_prop]);
          }          
        } else {
          args.push(undefined);
        }
      } else if (fn_arg.function) {
        // If arg has an internal function defined with args, apply it
        args.push(this.runNamedFunction(fn_arg, base_object, localFunctions));
      }
    }

    if (localFunctions && localFunctions[struct.function]) {
      // Checks if the function exist in the localFunctions argument
      return localFunctions[struct.function].apply(null, args);
    }
    if (['formatDate', 'getWeekDay'].includes(struct.function)) {
      return DateFormatService[struct.function].apply(null, args);
    }
    if (['calcClassIdh', 'getClassIdh', 'calcProportionSalary'].includes(struct.function)) {
      let model = new IndicatorsModel();
      return model[struct.function].apply(model, args);
    }
    if (['calcIndexPercentage', 'calcDeltaPercentage', 'getAbsoluteValue', 'getPaceString'].includes(struct.function)) {
      return NumberTransformService[struct.function].apply(null, args);
    }
    if (['applyInterpolReplaceDatasetParam'].includes(struct.function)) {
      args.push(localFunctions);
      args.push(customParams);
      return TextTransformService[struct.function].apply(null, args);
    }
    if (this[struct.function]) {
      return this[struct.function].apply(null, args);
    }
    
    // Returns null otherwise
    return null;
  }
  
  // TODO - Do we need a function in object Transform just to check GT?
  static valueCheck(value: number, baseValue: number = 0, returnTextInCaseOfHigherThanBaseValue: string = '', returnTextInCaseOfLowerThanBaseValue: string = '') {
    return value > baseValue ? returnTextInCaseOfHigherThanBaseValue : returnTextInCaseOfLowerThanBaseValue ;
  }
}

export default ObjectTransformService;