import * as yaml from 'js-yaml'
import axios from 'axios'

class YamlFetcherService {
    constructor() {}

    static loadYaml(location, cbFunction, context) {
        let basePath = "/static/smartlab-initiative-viewconf/";
        if (this.$store && this.$store.state && this.$store.state.GIT_VIEWCONF_TAG_URL) {
            basePath = this.$store.state.GIT_VIEWCONF_TAG_URL;
        } else if (process.env.GIT_VIEWCONF_TAG_URL) {
            basePath = process.env.GIT_VIEWCONF_TAG_URL;
        }
        return axios.get(basePath + location + ".yaml")
            .then((response) => {
                return yaml.safeLoad(response.data, { json: true });
            });
        
    }

    async loadYamlArray(currentStruct, yamlArray, finalCbFunction) {
        let promises = [];
        let promises_alt = [];
        
        let basePath = this.$store.state.GIT_VIEWCONF_TAG_URL ? this.$store.state.GIT_VIEWCONF_TAG_URL : "/static/smartlab-initiative-viewconf/";
        
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