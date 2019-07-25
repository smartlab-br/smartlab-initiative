const TranslationModel = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          locales: [
            { lbl: 'Português', value: 'pt', flag: '/static/flags/br.svg',
              browser_langs: ['pt', 'pt-br', 'pt-BR'] },
            { lbl: 'English', value: 'en', flag: '/static/flags/us.svg',
              browser_langs: ['en', 'en-gb', 'en-GB'] } 
          ]
        }
      },
      methods: {
        findAllLocales() {
          return this.locales;
        },
        
        findBrowserLocale() {
          if (this.$store.state.LOCALE) {
            return this.$store.state.LOCALE;
          }
          var b_lang = navigator.language || navigator.userLanguage;
          for (var lng in this.locales) {
            if (this.locales[lng].browser_langs.includes(b_lang)) {
              this.$store.state.LOCALE = this.locales[lng];
              return this.locales[lng];
            }
          }
        },

        setLocale(locale) {
          // Sobrescreve apenas se efetivamente alterado
          if (this.$store.state.LOCALE && locale && this.$store.state.LOCALE !== locale.value) {
            this.$store.state.LOCALE = locale.value;
          } else if ((this.$store.state.LOCALE == null || this.$store.state.LOCALE == undefined) && locale) {
            this.$store.state.LOCALE = locale.value;
          }
        }
      }
    });
  }
}

export default TranslationModel;