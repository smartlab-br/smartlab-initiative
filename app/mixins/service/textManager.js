const TextManager = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        applyInterpol(struct, customParams = {}, customFunctions = [], base_object = null, cbInvalidate = null) {
          if (struct !== null && struct !== undefined) {
            if (struct.fixed !== null && struct.fixed !== undefined) {
              return struct.fixed;
            }
            var tmplt = struct.template;
            var args = [];
            for (var indx in struct.args) {
              var iterArg = null;
              if (struct.args[indx].function) {
                iterArg = this.runNamedFunction(struct.args[indx], base_object, customFunctions);
              } else if (struct.args[indx].value) {
                iterArg = struct.args[indx].value;
              } else if (struct.args[indx].fixed) {
                iterArg = struct.args[indx].fixed;
              } else if (Array.isArray(base_object) && struct.args[indx].id){
                iterArg = this.$indicatorsModel.getIndicatorValueFromStructure(this, struct.args[indx], null, base_object);
                args.push(iterArg);
                continue;
              } else if (struct.args[indx].named_prop) {
                if (base_object){
                  iterArg = base_object[struct.args[indx].named_prop];
                }
                if (iterArg === null || iterArg === undefined){
                  if(struct.args[indx].base_object){
                    iterArg = customParams[struct.args[indx].base_object][struct.args[indx].named_prop];
                  } else {
                    iterArg = customParams[struct.args[indx].named_prop];
                  }
                } 
              } else if (struct.args[indx].link) {
                iterArg = "<a href='" + struct.args[indx].link + "'>" + struct.args[indx].text + "</a>";
              }

              if (iterArg != null) {
                if (struct.args[indx].format) {
                  let formatRules = struct.args[indx];
                  if (struct.args[indx].format == 'auto') {
                    formatRules = this.getFormatRules(struct.args[indx], iterArg);
                  }
                  iterArg = this.formatNumber(
                    iterArg, formatRules.format, formatRules.precision,
                    formatRules.multiplier, formatRules.collapse, formatRules.signed, 
                    formatRules.uiTags
                  );
                }
                args.push(iterArg);
              } else if (struct.args[indx].required && cbInvalidate !== null) {
                cbInvalidate.apply(null);
              } else {
                args.push(struct.args[indx].default);
              }
            }
            return this.replaceArgs(tmplt, args, cbInvalidate);
          }
          return '';
        },

        // Reposiciona os parâmetros, uma vez que recebe automaticamente um row do dataset como primeiro
        applyInterpolReplaceDatasetParam(dataset_object, struct, customFunctions = [], base_object = null, cbInvalidate = null) {
          return this.applyInterpol(struct, {}, customFunctions, dataset_object, cbInvalidate);
        },

        replaceArgs(string, args, cbInvalidate = null) {
          if (string === null || string === undefined) {
            return '';
          }
          for (var i = 0; i < args.length; i ++) {
            var reg = new RegExp('\\{' + i + '\\}', 'gm');
            string = string.replace(reg, args[i]);
          }
          return string;
        },
        replaceSpecialCharacters(string){
          string = string.replace(/[áàâãä]/,"a");
          string = string.replace(/[ÁÀÂÃÄ]/,"A");
          string = string.replace(/[éèê]/, "e");
          string = string.replace(/[ÉÈÊ]/, "E");
          string = string.replace(/[íì]/, "i");
          string = string.replace(/[ÍÌ]/, "I");
          string = string.replace(/[óòôõö]/, "o");
          string = string.replace(/[ÓÒÔÕÖ]/, "O");
          string = string.replace(/[úùü]/, "u");
          string = string.replace(/[ÚÙÜ]/, "U");
          string = string.replace(/ç/, "c");
          string = string.replace(/Ç/, "C");
          return string;
        }
      }
    });
  }
}

export default TextManager;