import YamlFetcherService from '../../service/singleton/yamlFetcher'

class DimensionsModel {
    constructor() {
        this.isLoading = true;
        YamlFetcherService.loadYaml("br/dimensao/base", this.setDimensions, this);
    }

    setDimensions(content, context) {
        context.dimensions = content;
        context.isLoading = false;
    }

    getDimensions(idObservatorio = null, cbFunction = null) {
        if (idObservatorio === null || idObservatorio === undefined) {
            if (!this.dimensions && !this.isLoading) { // Start loading only once
                this.isLoading = true;
                YamlFetcherService.loadYaml(
                    "br/dimensao/base",
                    cbFunction ? cbFunction : this.setDimensions,
                    this
                );
            } else if (cbFunction) {
                cbFunction(this.dimensions);
            } else {
                return this.dimensions;
            }
        } else {
            YamlFetcherService.loadYaml("br/dimensao/" + idObservatorio, cbFunction, this);
        }
    }
    
    findDimensionById(id) {
        if (this.dimensions && this.isLoading) { // Only when loaded
            for (var eachDim of this.dimensions.dimensoes) {
                if (eachDim.id == id) return eachDim;
            }
            return this.dimensions.dimensoes[0];
        }
    }

    getDimensionByObservatoryAndId(obs, id = null) { // TODO Wait for loading
        let dims = this.loadYaml("br/dimensao/" + obs).dimensoes;
        for (let indx in dims) {
            if ((id === null || id === undefined) && dims[indx].default) return dims[indx];
            if (dims[indx].id == id) return dims[indx];
        }
    }
}

export default DimensionsModel;