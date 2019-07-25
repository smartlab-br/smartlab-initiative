const AboutModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          about: require("json-loader!yaml-loader!../../trabalhodecente-viewconf/br/about.yaml")
        }
      },
      methods: {
        getFullAbout() {
          return this.about;
        },
        getAbout() {
          return this.about.plataforma.sections;
        },
        getHistory() {
          return this.about.history.sections[0].list;
        },
        getPartners() {
          return this.about.parceiros.sections[0].list;
        }
      }
    })
  }
}

export default AboutModel;