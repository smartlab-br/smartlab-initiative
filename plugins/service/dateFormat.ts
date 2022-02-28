interface IDictDayOfWeekBR {
  [key: string]: string;
}

const WEEKDAYS: IDictDayOfWeekBR = {
  seg: "SEGUNDA",
  ter: "TERÇA",
  qua: "QUARTA",
  qui: "QUINTA",
  sex: "SEXTA",
  'sáb': "SÁBADO",
  dom: "DOMINGO"
}

class DateFormatService {
  static formatDate(base_object: any, prop: string, formato: string | null = null, formatoFinal: string | null = null, stringAppend: string = '') {
    let stringOriginal = base_object[prop].toString();
    let year = stringOriginal.substring(0,4);
    let month = stringOriginal.substring(4,6);
    let day = stringOriginal.substring(6);
    let utfString = year + '-' + month + '-' + day;
    
    if (stringAppend) utfString += stringAppend;
    return utfString;
  }

  static getWeekDay(abbrev: string) { return WEEKDAYS[abbrev]; }
}

export default function({ app }: any, inject: any) {
  inject('getDateFormatService', DateFormatService)
}
export { DateFormatService }
