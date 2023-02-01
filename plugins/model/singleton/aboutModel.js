// import YamlFetcherService from '../../service/singleton/yamlFetcherService'

export class AboutModel {
  constructor (context) {
    this.context = context
  }

  setAbout (content) {
    this.about = content
    return this.about
  }

  getAbout () {
    if (this.about == null && this.about == undefined) { // Start loading only once
      return this.context.$yamlFetcherService.loadYaml('br/about')
        .then((result) => { return this.setAbout(result) })
    } else {
      return this.about
    }
  }

  getPlatform () {
    return this.about.plataforma.sections
  }

  getHistory () {
    return this.about.history.sections[0].list
  }

  getPartners () {
    return this.about.parceiros.sections[0].list
  }
}
