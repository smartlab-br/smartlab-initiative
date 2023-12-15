import * as yaml from "js-yaml"

export class YamlFetcherService {

  static getBasePath() {
    const config = useRuntimeConfig()
    if (config.public.gitViewConfUrl) { return "/viewconf/" }
    return "/smartlab-initiative-viewconf/"
  }

  static async loadYaml(location: string) {
    const response: any = await $fetch(this.getBasePath() + location + ".yaml")
    return yaml.load(response, { json: true })
  }

  static async loadYamlArray(currentStruct: any, yamlArray: any[]) {
    const promises = []
    const basePath = this.getBasePath()

    let response: any 
    for (const yamlConfIndex in yamlArray) {
      response = $fetch(basePath + yamlArray[yamlConfIndex].main + ".yaml").catch(() => {
        if (yamlArray[yamlConfIndex].alt) {
          response =  $fetch(basePath + yamlArray[yamlConfIndex].alt + ".yaml").catch(() => Promise.resolve(null))
        }
      })
      promises.push(yaml.load(response, { json: true }))
    }

    // Define a execução após a realização de todos os promises
    const structs = await Promise.all(promises)
    let result_1 = currentStruct || {}
    for (const structIndx of structs) {
      result_1 = Object.assign(result_1, structIndx)
    }
    return result_1
  }
}
