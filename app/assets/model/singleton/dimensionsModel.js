import YamlFetcherService from '../../service/singleton/yamlFetcherService'

class DimensionsModel {
    constructor() { }

    setStore(store) {
        this.store = store;
        this.yamlFetcher = new YamlFetcherService(store);
    }
    setDimensions(content) {
        this.dimensions = content;
        return this.dimensions;
    }

    getDimensions(idObservatorio = null, cbFunction = null) {
        if (idObservatorio === null || idObservatorio === undefined) {
            if (this.dimensions == null && this.dimensions == undefined) { // Start loading only once
                return this.yamlFetcher.loadYaml("br/dimensao/base")
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
            return this.yamlFetcher.loadYaml("br/dimensao/" + idObservatorio)
                .then((result) => { 
                    if (cbFunction) {
                        cbFunction(result); 
                    } else {
                        return this.setDimensions(result);
                    }
                });
        }
    }
    
    findDimensionById(id) {
        if (this.dimensions) { // Only when loaded
            for (var eachDim of this.dimensions.dimensoes) {
                if (eachDim.id == id) return eachDim;
            }
            return this.dimensions.dimensoes[0];
        }
    }

    getDimensionByObservatoryAndId(obs, id = null) {
        return this.yamlFetcher.loadYaml("br/dimensao/" + obs)
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