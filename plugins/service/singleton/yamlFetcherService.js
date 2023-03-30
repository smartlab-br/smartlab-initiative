import * as yaml from 'js-yaml'

export class YamlFetcherService {
  constructor (context) {
    this.context = context
  }

  getBasePath () {
    if (this.context.$config.gitViewConfUrl) { return '/viewconf/' }
    return '/smartlab-initiative-viewconf/'
  }

  async loadYaml (location) {
    const response = await this.context.$axios.$get(this.getBasePath() + location + '.yaml')
    return yaml.safeLoad(response, { json: true })
  }

  async loadYamlArray (currentStruct, yamlArray) {
    const promises = []
    const basePath = this.getBasePath()

    // TODO Need to intercept 404 errors thrown to the browser console.
    for (const yamlConfIndex in yamlArray) {
      promises.push(
        this.context.$axios.$get(basePath + yamlArray[yamlConfIndex].main + '.yaml')
          .then((response) => {
            return yaml.safeLoad(response, { json: true })
          }).catch((_error) => {
            if (yamlArray[yamlConfIndex].alt) {
              this.context.$axios.$get(basePath + yamlArray[yamlConfIndex].alt + '.yaml')
                .then((response) => {
                  return yaml.safeLoad(response, { json: true })
                }).catch((_error) => { Promise.resolve(null) })
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
