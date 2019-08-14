import YamlFetcherService from '../../service/singleton/yamlFetcher'

class DimensionsModel {
    constructor() { }

    setDimensions(content) {
        this.dimensions = content;
        this.isLoading = false;
        return this.dimensions;
    }

    getDimensions(idObservatorio = null, cbFunction = null) {
        if (idObservatorio === null || idObservatorio === undefined) {
            if ((this.dimensions == null && this.dimensions == undefined) && !this.isLoading) { // Start loading only once
                this.isLoading = true;
                return YamlFetcherService.loadYaml("br/dimensao/base")
                    .then((result) => {
                        if (cbFunction) {
                            cbFunction(result);
                        } else {
                            return this.setDimensions(result);
                        }
                    });
            } else if (cbFunction) {
                cbFunction(this.dimensions);
            } else {
                return this.dimensions;
            }
        } else {
            YamlFetcherService.loadYaml("br/dimensao/" + idObservatorio)
                .then((result) => { cbFunction(result); });
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

    getDimensionByObservatoryAndId(obs, id = null) {
        return YamlFetcherService.loadYaml("br/dimensao/" + obs)
            .then((result) => {
                let dims = result.dimensoes;
                for (let indx in dims) {
                    if ((id === null || id === undefined) && dims[indx].default) return dims[indx];
                    if (dims[indx].id == id) return dims[indx];
                }
            });
    }
}

export default DimensionsModel;