import DateFormatService from './dateFormatService.js'
import IndicatorsModel from '../../model/singleton/indicatorsModel.js'

class ObjectTransformService {
  constructor() {
    this.dateFormatService = new DateFormatService();
  }

  runNamedFunction(struct, base_object, localFunctions = null, initialArgs = []) {
    // Runs function with args defines in yaml structure
    var args = initialArgs;
    
    for (var indx in struct.fn_args) {
      // Gets the args for the yaml-defined function
      if (struct.fn_args[indx].fixed != null && struct.fn_args[indx].fixed != undefined) {
        // Apply fized value to arg
        args.push(struct.fn_args[indx].fixed);
      } else if (struct.fn_args[indx].named_prop) {
        if (base_object) {
          args.push(base_object[struct.fn_args[indx].named_prop]);
        } else {
          args.push(undefined);
        }
      } else if (struct.fn_args[indx].function) {
        // If arg has an internal function defined with args, apply it
        args.push(this.runNamedFunction(struct.fn_args[indx], base_object, localFunctions));
      }
    }

    if (localFunctions && localFunctions[struct.function]) {
      // Checks if the function exist in the localFunctions argument
      return localFunctions[struct.function].apply(null, args);
    }
    if (struct.function == 'formatDate') {
      return this.dateFormatService[struct.function].apply(null, args);
    }
    if (struct.function == 'calc_class_idh') {
      return (new IndicatorsModel())[struct.function].apply(null, args);
    }
    
    
    // Returns null otherwise
    return null;
  }
}

export default ObjectTransformService;