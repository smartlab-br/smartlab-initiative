import * as yaml from 'js-yaml'
import axios from 'axios'

export class YamlFetcherService {
  getBasePath () {
    if (process.env.GIT_VIEWCONF_TAG_URL) { return process.env.GIT_VIEWCONF_TAG_URL }
    return '/smartlab-initiative-viewconf/'
  }

  async loadYaml (location) {
    const response = await axios.get(this.getBasePath() + location + '.yaml')
    return yaml.safeLoad(response.data, { json: true })
  }

  async loadYamlArray (currentStruct, yamlArray) {
    const promises = []
    const basePath = this.getBasePath()

    // TODO Need to intercept 404 errors thrown to the browser console.
    for (const yamlConfIndex in yamlArray) {
      promises.push(
        axios.get(basePath + yamlArray[yamlConfIndex].main + '.yaml')
          .then((response) => {
            return yaml.safeLoad(response.data, { json: true })
          }).catch((error) => {
            if (yamlArray[yamlConfIndex].alt) {
              axios.get(basePath + yamlArray[yamlConfIndex].alt + '.yaml')
                .then((response) => {
                  return yaml.safeLoad(response.data, { json: true })
                }).catch((error) => { Promise.resolve(null) })
            }
          })
      )
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
