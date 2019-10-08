import * as yaml from 'js-yaml'
import axios from 'axios'

class YamlFetcherService {
    constructor(store) {
        this.store = store;
    }

    setStore(store) {
        this.store = store;
    }

    getBasePath() {
        if (this.store && this.store.GIT_VIEWCONF_TAG_URL) return this.store.GIT_VIEWCONF_TAG_URL;
        if (process.env.GIT_VIEWCONF_TAG_URL) return process.env.GIT_VIEWCONF_TAG_URL;
        return "/static/smartlab-initiative-viewconf/";
    }

    loadYaml(location) {
        return axios.get(this.getBasePath() + location + ".yaml")
            .then((response) => {
                return yaml.safeLoad(response.data, { json: true });
            });
    }

    loadYamlArray(currentStruct, yamlArray) {
        let promises = [];
        let basePath = this.getBasePath();
        
        // TODO Need to intercept 404 errors thrown to the browser console.
        for (let yamlConfIndex in yamlArray) {	
            promises.push(
                axios.get(basePath + yamlArray[yamlConfIndex].main + ".yaml")
                    .then(response => {
                        return yaml.safeLoad(response.data, { json: true })
                    }).catch(error => {
                        if (yamlArray[yamlConfIndex].alt) {
                            axios.get(basePath + yamlArray[yamlConfIndex].alt + ".yaml")
                                .then(response => {
                                    return yaml.safeLoad(response.data, { json: true });
                                }).catch(error => { resolve(null); });
                        }
                    })
            );
        }

        // Define a execução após a realização de todos os promises
        return Promise.all(promises).then(
            (structs) => {
                let result = currentStruct ? currentStruct : {};
                for (let structIndx of structs) {
                    result = Object.assign(result, structIndx);
                }
                return result;
            }
        );
    }
}

export default YamlFetcherService;