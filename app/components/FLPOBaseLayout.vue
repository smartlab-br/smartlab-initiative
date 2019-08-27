<script>
  export default {
    props: ['structure', 'customParams', 'customFunctions', 'topology',
            'topologyUf', 'sectionIndex','selectedPlace'],
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
        this.errorMessage = message;
      },
      
      setComplexAttribute(base_object_list, rules, structure, addedParams = null, metadata = null) {
        if (typeof base_object_list == 'string') {
          this[addedParams.attribute] = base_object_list;
        } else {
          let base_object = {};
          if (Array.isArray(base_object_list) && base_object_list.length == 1) {
            base_object = base_object_list[0];
          } else if (base_object_list !== null && base_object_list !== undefined) {
            base_object = base_object_list;
          }
          this[addedParams.attribute] = this.applyInterpol(
            structure,
            this.customParams,
            this.customFunctions,
            base_object,
            this.sendInvalidInterpol
          );
          // this[addedParams.attribute] = this.replaceArgs(
          //   structure.template,
          //   this.$indicatorsModel.indicatorsToValueArray(
          //     this,
          //     structure.args, 
          //     this.customFunctions, 
          //     base_object_list,
          //     this.sendInvalidInterpol
          //   ),
          //   this.sendInvalidInterpol
          // );
        }
      }
    }
  }
</script>

