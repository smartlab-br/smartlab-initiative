export class DateFormatService {
  weekDays = {
    seg: 'SEGUNDA',
    ter: 'TERÇA',
    qua: 'QUARTA',
    qui: 'QUINTA',
    sex: 'SEXTA',
    sáb: 'SÁBADO',
    dom: 'DOMINGO'
  }

  constructor () {}

  formatDate (base_object, prop, formato = null, formatoFinal = null, stringAppend = '') {
    const stringOriginal = base_object[prop].toString()
    const year = stringOriginal.substring(0, 4)
    const month = stringOriginal.substring(4, 6)
    const day = stringOriginal.substring(6)
    let utfString = year + '-' + month + '-' + day

    if (stringAppend) { utfString += stringAppend }
    return utfString
  }

  getWeekDay (abbrev) { return this.weekDays[abbrev] }
}
