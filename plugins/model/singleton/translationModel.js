export class TranslationModel {
  locales = [
    {
      lbl: 'Português',
      value: 'pt',
      flag: '/flags/br.svg',
      browser_langs: ['pt', 'pt-br', 'pt-BR']
    },
    {
      lbl: 'English',
      value: 'en',
      flag: '/flags/us.svg',
      browser_langs: ['en', 'en-gb', 'en-GB']
    }
  ]

  constructor () {
    this.currentLocale = 'pt'
  }

  findAllLocales () {
    return this.locales
  }

  findBrowserLocale () {
    const b_lang = navigator.language || navigator.userLanguage
    for (const lng of this.locales) {
      if (lng.browser_langs.includes(b_lang)) { return lng }
    }
    return this.locales[0]
  }

  getLocale () {
    if (this.currentLocale) {
      for (const lng of this.locales) {
        if (lng.browser_langs.includes(this.currentLocale)) { return lng }
      }
    }
    const locale = this.findBrowserLocale()
    if (locale) {
      this.currentLocale = locale.value
      return locale
    }
  }

  setLocale (locale) {
    // Sobrescreve apenas se efetivamente alterado
    if (locale === null || locale === undefined) { return }
    if (this.currentLocale && this.currentLocale !== locale.value) {
      this.currentLocale = locale.value
    } else if (this.currentLocale == null || this.currentLocale == undefined) {
      this.currentLocale = locale.value
    }
  }
}
