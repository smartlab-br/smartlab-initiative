
// import YamlFetcherService from '../../service/singleton/yamlFetcherService'
// import ColorsService from '../../service/singleton/colorsService';

export class ObservatoriesModel {
  constructor (context) {
    this.context = context
  }

  setContent (content) {
    this.content = content
    return this.content
  }

  setObservatories (content) {
    this.observatories = content.observatorios
    return this.observatories
  }

  setBackgroundImages (content) {
    this.background_images = content.background_images
    return this.background_images
  }

  setSections (content) {
    this.sections = content.secoes
    return this.sections
  }

  setFooter (content) {
    this.footer = content.rodape
    return this.footer
  }

  async getContent () {
    if (this.content == null || this.content == undefined) {
      this.content = await this.context.$yamlFetcherService.loadYaml('br/observatorios')
    }
    return this.content
  }

  async getBackgroundImages () {
    if (this.background_images == null || this.background_images == undefined) {
      this.content = await this.getContent()
      this.background_images = this.content.background_images
    }
    return this.background_images
  }

  async getObservatories () {
    if (this.observatories == null || this.observatories == undefined) {
      this.content = await this.getContent()
      this.observatories = this.content.observatorios
    }
    return this.observatories
  }

  async getSections () {
    if (this.sections == null || this.sections == undefined) {
      this.content = await this.getContent()
      this.sections = this.content.secoes
    }
    return this.sections
  }

  async getFooter () {
    if (this.footer == null || this.footer == undefined) {
      this.content = await this.getContent()
      this.footer = this.content.rodape
    }
    return this.footer
  }

  getObservatoryById (id) {
    if (this.observatories) {
      for (const item of this.observatories) {
        if (item.id == id) { return item }
      }
    }
    return null
  }

  identifyObservatory (route) {
    if (route.includes('trabalhodecente')) { return 'td' }
    if (route.includes('diversidade')) { return 'des' }
    if (route.includes('trabalhoescravo')) { return 'te' }
    if (route.includes('trabalhoinfantil')) { return 'ti' }
    if (route.includes('sst')) { return 'sst' }
    if (route.includes('covid')) { return 'cov' }
    return null
  }

  // Mapeamento dos IDs para os observatorios
  identifyObservatoryById (idObservatorio) {
    switch (idObservatorio) {
      case 'td':
        return 'trabalhodecente'
      case 'des':
        return 'diversidade'
      case 'te':
        return 'trabalhoescravo'
      case 'ti':
        return 'trabalhoinfantil'
      case 'sst':
        return 'sst'
      case 'cov':
        return 'covid'
    }
  }

  getTheme (observatorio) {
    return this.context.$colorsService.getThemeFromId(observatorio)
  }
}
