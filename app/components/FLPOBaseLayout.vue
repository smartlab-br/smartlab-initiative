<script>
  export default {
    props: ['structure', 'customParams', 'customFunctions', 'topology',
            'topologyUf', 'sectionIndex'],
    methods: {
    
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
          this[addedParams.attribute] = this.$textTransformService.applyInterpol(
            structure,
            this.customParams,
            this.customFunctions,
            base_object,
            this.sendInvalidInterpol
          );
          // this[addedParams.attribute] = this.$textTransformService.replaceArgs(
          //   structure.template,
          //   this.$indicatorsModel.indicatorsToValueArray(
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

<style>
  @import "../node_modules/leaflet/dist/leaflet.css";
  @import "../node_modules/leaflet.markercluster/dist/MarkerCluster.css";
  @import "../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css";

  .leaflet-container {
        font-family: Palanquin !important;
  }
  .leaflet-interactive {
    cursor: pointer;
  }
</style>