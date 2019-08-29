class DateFormatService {
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
}

export default DateFormatService;