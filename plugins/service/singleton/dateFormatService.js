export class DateFormatService {
  weekDays = {
    seg: "SEGUNDA",
    ter: "TERÇA",
    qua: "QUARTA",
    qui: "QUINTA",
    sex: "SEXTA",
    'sáb': "SÁBADO",
    dom: "DOMINGO"
  }
  constructor() {}

  formatDate(base_object, prop, formato = null, formatoFinal = null, stringAppend = '') {
    let stringOriginal = base_object[prop].toString();
    let year = stringOriginal.substring(0,4);
    let month = stringOriginal.substring(4,6);
    let day = stringOriginal.substring(6);
    let utfString = year + '-' + month + '-' + day;
    
    if (stringAppend) utfString += stringAppend;
    return utfString;
  }

  getWeekDay(abbrev) { return this.weekDays[abbrev]; }
}
