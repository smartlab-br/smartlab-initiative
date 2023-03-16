
// import YamlFetcherService from '../../service/singleton/yamlFetcherService'
// import ColorsService from '../../service/singleton/colorsService';

export class ObservatoriesModel {
  constructor (context) {
    this.context = context
  }

  async setContent () {
    this.content = await this.context.$yamlFetcherService.loadYaml('br/observatorios')
  }

  async setObservatories () {
    if (this.content == null || this.content == undefined) {
      this.content = await this.context.$yamlFetcherService.loadYaml('br/observatorios')
    }
    this.observatories = this.content.observatorios
  }

  async setBackgroundImages () {
    if (this.content == null || this.content == undefined) {
      this.content = await this.context.$yamlFetcherService.loadYaml('br/observatorios')
    }
    this.background_images = this.content.background_images
  }

  async setSections () {
    if (this.content == null || this.content == undefined) {
      this.content = await this.context.$yamlFetcherService.loadYaml('br/observatorios')
    }
    this.sections = this.content.secoes
  }

  async setFooter () {
    if (this.content == null || this.content == undefined) {
      await this.setContent()
    }
    this.footer = this.content.rodape
  }

  async getContent () {
    if (this.content == null || this.content == undefined) {
      await this.setContent()
    }
    return this.content
  }

  async getBackgroundImages () {
    if (this.background_images == null || this.background_images == undefined) {
      await this.setBackgroundImages()
    }
    return this.background_images
  }

  async getObservatories () {
    if (this.observatories == null || this.observatories == undefined) {
      await this.setObservatories()
    }
    return this.observatories
  }

  async getSections () {
    if (this.sections == null || this.sections == undefined) {
      await this.setSections()
    }
    return this.sections
  }

  async getFooter () {
    if (this.footer == null || this.footer == undefined) {
      await this.setFooter()
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
