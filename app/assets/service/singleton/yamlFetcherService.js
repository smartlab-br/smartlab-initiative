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

    loadYamlArray(currentStruct, yamlArray, finalCbFunction) {
        let promises = [];
        let promises_alt = [];
        
        let basePath = this.getBasePath();
        
        // TODO Need to intercept 404 errors thrown to the browser console.
        for (let yamlConfIndex in yamlArray) {	
            promises[yamlConfIndex] = new Promise(
                function(resolve, reject) {
                    axios.get(basePath + yamlArray[yamlConfIndex].main + ".yaml")
                        .then(response => {
                            resolve(yaml.safeLoad(response.data, { json: true }))
                        }).catch(error => { resolve(null); });
                }
            );

            if (yamlArray[yamlConfIndex].alt) {
                promises_alt[yamlConfIndex] = new Promise(
                    function(resolve, reject) {
                        axios.get(basePath + yamlArray[yamlConfIndex].alt + ".yaml")
                            .then(response => {
                                resolve(yaml.safeLoad(response.data, { json: true }));
                            }).catch(error => { resolve(null); });
                    }
                );
            }
        }

        // Define a execução após a realização de todos os promises
        Promise.all(promises).then(
            (structs) => {
                let checked = [];
                let result = currentStruct ? currentStruct : {};
                for (let structIndx in structs) {
                    if (structs[structIndx]) {
                        checked.push(structIndx);
                        result = Object.assign(result, structs[structIndx]);
                    }
                }
                
                Promise.all(promises_alt).then(
                    (structs_alt) => {
                        for (let structIndx in structs_alt) {
                            if (structs_alt[structIndx] && !checked.includes(structIndx)) {
                                result = Object.assign(result, structs_alt[structIndx]);
                            }
                        }
                        finalCbFunction(result);
                    }
                );
            }
        );
    }
}

export default YamlFetcherService;