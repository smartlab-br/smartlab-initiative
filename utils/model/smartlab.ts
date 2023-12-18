import { YamlFetcherService } from "../service/singleton/yamlFetcher"

export class Smartlab {
  content: any
  observatories: any
  background_images?: string[]
  sections: any
  footer: any

  constructor (data: any) {
    this.content = data
    this.observatories = data.observatorios.filter((obs: any) => !obs.external)
    this.background_images = data.background_images
    this.sections = data.secoes
    this.footer = data.rodape
  }

  static async getData () {
    const data: any = await YamlFetcherService.loadYaml("br/observatorios")
    return data
  }

  getObservatoryById (id: string) {
    if (this.observatories) {
      const obsSelected = this.observatories.find((obs: any) => obs.id == id)
      if (obsSelected) return obsSelected
    }
    return null
  }

  static identifyObservatory(route: string) {
    if (route.includes("trabalhodecente")) return "td"
    if (route.includes("diversidade")) return "des"
    if (route.includes("trabalhoescravo")) return "te"
    if (route.includes("trabalhoinfantil")) return "ti"
    if (route.includes("sst")) return "sst"
    if (route.includes("covid")) return "cov"
    return "td"
  }

  static identifyObservatoryById(idObservatorio: string) {
    switch (idObservatorio) {
    case "td":
      return "trabalhodecente"
    case "des":
      return "diversidade"
    case "te":
      return "trabalhoescravo"
    case "ti":
      return "trabalhoinfantil"
    case "sst":
      return "sst"
    case "cov":
      return "covid"
    }
    return "trabalhodecente"
  }

  static changeTheme (observatorio: string) {
    // TODO Chamar direto a função changeTheme do ColorsService e excluir essa função
    return ColorsService.changeTheme(observatorio)
  }

}
