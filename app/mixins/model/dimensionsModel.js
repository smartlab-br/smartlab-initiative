const DimensionsModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          globalDimensions: null
        }
      },
      created() {
        this.loadYaml("br/dimensao/base", this.setGlobalDimensions);
      },
      methods: {
        setGlobalDimensions(content) {
          this.globalDimensions = content;
        },
        getDimensions(idObservatorio = null, cbFunction = null) {
          if (idObservatorio === null || idObservatorio === undefined) {
            if (cbFunction) { 
              cbFunction(this.globalDimensions.dimensoes);
            } else {
              return this.globalDimensions.dimensoes;
            }
          }
          this.loadYaml("br/dimensao/" + idObservatorio, cbFunction);
        },

        findDimensionById(id) {
          for (var eachDim of this.globalDimensions.dimensoes) {
            if (eachDim.id == id) return eachDim;
          }
          return this.globalDimensions.dimensoes[0];
        },

        getDimensionByObservatoryAndId(obs, id = null) {
          let dims = this.loadYaml("br/dimensao/" + obs).dimensoes;
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