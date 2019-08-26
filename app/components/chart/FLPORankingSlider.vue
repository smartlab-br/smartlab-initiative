<template>
  <v-layout px-0 row wrap>
    <v-flex xs12 sm12 class="text-xs-center subheading">{{ structure.label }}</v-flex>
    <v-flex xs12 sm12 px-5 mx-5>
      <v-slider
        v-model="value"
        thumb-color="accent"
        color="accent"
        thumb-label="always"
        always-dirty
        inverse-label
        :label="String(max)"
        readonly
        :step="step"
        :min="min" 
        :max="max">
      </v-slider>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    data () {
      return {
        value: null,
        step: 1,
        min: null,
        max: null
      }
    },
    props: ['structure', 'customParams', 'customFunctions'],
    created () {
      this.fillDataStructure(
        this.structure, this.customParams,
        this.customFunctions, this.autoFillLayout,
        { innerProp: 'dataset' }
      );
    },
    computed: {
    },
    mounted: function() {
    },
    methods: {
      sendError(message) {
        this.$emit('showSnackbar', { color : 'error', text: message });
      },
      
      setTotalSiblings(sectionType, type, scope) {

        var idLocalidade = this.customParams.idLocalidade;
        if (idLocalidade == 0){ //Brasil
          // No siblings
        } else if (idLocalidade.length == 1){ //Região
          // TODO
        } else if (idLocalidade.length == 2){ //Estado
          // TODO
        } else if (idLocalidade.length == 4){ //Mesorregião
          // TODO
        } else if (idLocalidade.length == 5){ //Microrregião
          // TODO
        } else {
          var callback = this.setAttribute;
          var cb_args = [sectionType, type];
          if (scope == 'br') {
            this.$analysisUnitModel.setTotalMunicipios(this, callback, cb_args);
          } else {
            this.$analysisUnitModel.setTotalMunicipiosPorUF(this, idLocalidade.substring(0,2), callback, cb_args);
          }
        }
      },

      setTotalMunPorUF(sectionType, type) {
        var callback = this.setAttribute;
        var cb_args = [sectionType, type];
        this.$analysisUnitModel.setTotalMunicipiosPorUF(this, this.customParams.idLocalidade.substring(0,2), callback, cb_args);
      },

      setAttribute(sectionType, type, value) {
        if (sectionType == 'slider') {
          this[type] = value;
        }
      },

      getUF() {
        var idLocalidade = this.customParams.idLocalidade;
        if (idLocalidade == 0){ //Brasil
          // No siblings
        } else if (idLocalidade.length == 1){ //Região
          // TODO
        } else if (idLocalidade.length == 2){ //Estado
          // TODO
        } else if (idLocalidade.length == 4){ //Mesorregião
          // TODO
        } else if (idLocalidade.length == 5){ //Microrregião
          // TODO
        } else { // Município
          return idLocalidade.substring(0,2);
        }
      }
    }
  }
</script>

<style>
  .v-input--slider .v-slider__thumb-label {
    color: black !important;
  }
</style>
