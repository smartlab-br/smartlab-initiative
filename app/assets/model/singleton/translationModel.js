class TranslationModel {
  locales = [
    { lbl: 'Português', value: 'pt', flag: '/static/flags/br.svg',
      browser_langs: ['pt', 'pt-br', 'pt-BR'] },
    { lbl: 'English', value: 'en', flag: '/static/flags/us.svg',
      browser_langs: ['en', 'en-gb', 'en-GB'] } 
  ]

  constructor() { }

  findAllLocales() {
    return this.locales;
  }
  
  findBrowserLocale(context) {
    if (context.$store.state.LOCALE) {
      return context.$store.state.LOCALE;
    }
    var b_lang = navigator.language || navigator.userLanguage;
    for (var lng in this.locales) {
      if (this.locales[lng].browser_langs.includes(b_lang)) {
        context.$store.state.LOCALE = this.locales[lng];
        return this.locales[lng];
      }
    }
  }

  setLocale(context, locale) {
    // Sobrescreve apenas se efetivamente alterado
    if (context.$store.state.LOCALE && locale && context.$store.state.LOCALE !== locale.value) {
      context.$store.state.LOCALE = locale.value;
    } else if ((context.$store.state.LOCALE == null || context.$store.state.LOCALE == undefined) && locale) {
      context.$store.state.LOCALE = locale.value;
    }
  }

}

export default TranslationModel;
