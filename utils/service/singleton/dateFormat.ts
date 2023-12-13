interface IDictDayOfWeekBR {
  [key: string]: string;
}

const WEEKDAYS: IDictDayOfWeekBR = {
  seg: "SEGUNDA",
  ter: "TERÇA",
  qua: "QUARTA",
  qui: "QUINTA",
  sex: "SEXTA",
  "sáb": "SÁBADO",
  dom: "DOMINGO"
}

export class DateFormatService{
  // Adicionando uma assinatura de índice para permitir acesso dinâmico
  [index: string]: (...args: any[]) => void

  formatDate(base_object: any, prop: string, stringAppend: string = ""): string {
    const stringOriginal = base_object[prop].toString()
    const year = stringOriginal.substring(0,4)
    const month = stringOriginal.substring(4,6)
    const day = stringOriginal.substring(6)
    let utfString = year + "-" + month + "-" + day
    
    if (stringAppend) utfString += stringAppend
    return utfString
  }

  getWeekDay(abbrev: string): string {
    return WEEKDAYS[abbrev]
  }
}