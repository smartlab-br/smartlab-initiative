import axios from 'axios'

class YamlFetcherService {
    // constructor() {}
    static async loadYaml(location: string) {
        const response = await axios.get(`/api/viewconf?location=${location}`)
        return response.data
    }

    static async loadYamlArray(currentStruct: any, yamlArray: any) {
        let promises: Promise<any>[] = [];
        for (const yamlConf of yamlArray) {	
            promises.push(
                axios.get(`/api/viewconf?location=${yamlConf.main}`)
                    .catch((error) => {
                        if (yamlConf.alt) {
                            axios.get(`/api/viewconf?location=${yamlConf.alt}`)
                                .catch(error => { return null; });
                        }
                    })
            );
        }

        
        // Define a execução após a realização de todos os promises
        const structs = await Promise.all(promises)
        let result = currentStruct ? currentStruct : {};
        for (let structIndx of structs) {
            result = Object.assign(result, structIndx);
        }
        return result
    }
}

export default function({ app }: any, inject: any) {
    inject('getYamlFetcherService', YamlFetcherService)
}
export { YamlFetcherService }