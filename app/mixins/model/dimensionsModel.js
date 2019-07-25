const DimensionsModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          globalDimensions: require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/dimensao/base.yaml").dimensoes
        }
      },
      methods: {
        getDimensions(idObservatorio = null) {
          if (idObservatorio === null || idObservatorio === undefined) {
            return this.globalDimensions;
          }
          return require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/dimensao/" + idObservatorio + ".yaml").dimensoes;
        },

        findDimensionById(id) {
          for (var eachDim in this.globalDimensions) {
            if (this.globalDimensions[eachDim].id == id) {
              return this.globalDimensions[eachDim];
            }
          }
          return this.globalDimensions[0];
        },

        getDimensionByObservatoryAndId(obs, id = null) {
          let dims = require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/dimensao/" + obs + ".yaml").dimensoes;
          for (let indx in dims) {
            if ((id === null || id === undefined) && dims[indx].default) return dims[indx];
            if (dims[indx].id == id) return dims[indx];
          }
        }
      }
    })
  }
}

export default DimensionsModel;