interface IFormatOptions{
  valor: number
  formato: string
  casasDecimais: number
  multiplier: number
  collapse: IFormatOptions
  signed: boolean
  uiTags: boolean
}

class NumberTransformService {
  //constructor() {}

  static formatNumber(options: IFormatOptions) {
    if (isNaN(options.valor)) return options.valor;
    if (!options.valor) return "-";
    
    if (options.formato == 'cep'){
      const strValor: string = (`00000000${options.valor}`).slice(-8);
      return `${strValor.slice(0,5)}-${strValor.slice(-3)}`;
    }

    switch (options.formato) {
      case "dataDMY": {
        const strValor = new Date(options.valor.toString()).toISOString().substring(0,10);
        return `${strValor.substring(8,10)}/${strValor.substring(5,7)}/${strValor.substring(0,4)}`
      }
      case "dataYMD": {
        return new Date(options.valor.toString()).toISOString().substring(0,10);  
      }
    }
    
    const multiplier: number = options.multiplier ? options.multiplier : 1
    const signed: boolean = options.signed
    let uiTags: boolean = (options.uiTags === null || options.uiTags === undefined) ? true : options.uiTags
    
    let openUiTags = '';
    let closeUiTags = '';
    let unitPrefix = '';
    
    let curVal: number = options.valor * multiplier;
    let curCasasDecimais: number | null = options.casasDecimais
    let curFormato: string | null = options.formato
    
    // Verifica a ordem de grandeza do número, para poder reduzir o tamanho da string
    let collapseSuffix = '';
    let magnitude = 0;
    if (options.collapse) {
      magnitude = Math.floor((Math.floor(Math.abs(curVal)).toString().length - 1)/3);

      if (magnitude > 0) {
        uiTags = false;
        if ((options.collapse.uiTags === null || options.collapse.uiTags === undefined || options.collapse.uiTags) && uiTags) {
          uiTags = true;
        }
      }

      if (uiTags) {
        openUiTags = '<span>';
        closeUiTags = '</span>';
      }

      curVal = curVal / Math.pow(10, magnitude * 3);
      // Define o termo usado no final da string
      switch (magnitude) {
        case 1:
          collapseSuffix = openUiTags + 'mil' + closeUiTags;
          break;
        case 2:
          collapseSuffix = openUiTags + 'mi' + closeUiTags;
          break;
        case 3:
          collapseSuffix = openUiTags + 'bi' + closeUiTags;
          break;
        case 4:
          collapseSuffix = openUiTags + 'tri' + closeUiTags;
          break;
      }

      // Se contrair o dado, ver o formato resultante
      if (magnitude > 0) {
        curCasasDecimais = options.collapse.casasDecimais ? options.collapse.casasDecimais : null;
        curFormato = options.collapse.formato ? options.collapse.formato : null;
      }
      unitPrefix = curFormato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
      // if (magnitude > 0) {
      //   unitPrefix = "&plusmn;" + unitPrefix;
      // }
    } else {
      if (uiTags) {
        openUiTags = '<span>';
        closeUiTags = '</span>';
      }

      // Define um prefixo de unidade
      unitPrefix = options.formato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
      if (signed && curVal > 0) {
        unitPrefix = "+";
      }
    }
    
    curCasasDecimais = (curCasasDecimais) ? curCasasDecimais : 1;
    // Define a configuração do locale
    let localeConfig: Intl.NumberFormatOptions = {maximumFractionDigits: curCasasDecimais}

    if (curFormato == 'inteiro') {
      localeConfig.maximumFractionDigits = 0;
    } else {
      localeConfig.minimumFractionDigits = localeConfig.maximumFractionDigits;
    }

    let strVal: string = curVal.toLocaleString('pt-br', localeConfig);

    //Retira decimais quando zerados
    strVal = strVal.endsWith("," + "0".repeat(curCasasDecimais)) ? strVal.replace("," + "0".repeat(curCasasDecimais),""): strVal;

    // Substitui o collapseConfig apenas na porcentagem
    if (curFormato == 'porcentagem') collapseSuffix = openUiTags + "%" + closeUiTags;
    return `${unitPrefix}${strVal}${collapseSuffix}`
  }

  static getPaceString(interval: number, inverse: boolean = false) {
    // console.log(interval);
    if (inverse){
      interval = 1 / interval;
    }
    let days=Math.floor((interval/(1000*60*60*24)));
    let tmpInterval = interval - days*1000*60*60*24;
    let hours = Math.floor(tmpInterval/(1000*60*60));
    tmpInterval -= hours*1000*60*60;
    let minutes = Math.floor(tmpInterval/(1000*60));
    tmpInterval -= minutes*1000*60;
    let seconds = Math.floor(tmpInterval/(1000));
    tmpInterval -= seconds*1000;
    let milis = Math.floor(tmpInterval);

    let strInterval = "";
    let started = false;
    if (days > 0) {
      strInterval += " " + days + "d";
      started = true;
    }
    if (started) {
      strInterval += " " + hours + "h";
    } else {
      if (hours > 0) {
        strInterval += " " + hours + "h";
        started = true;
      }
    }

    if (started) {
      strInterval += " " + minutes + "m";
    } else {
      if (minutes > 0) {
        strInterval += " " + minutes + "m";
        started = true;
      }
    }
    
    if (started) {
      strInterval += " " + seconds + "s";
    } else {
      if (seconds > 0) {
        strInterval += " " + seconds + "s";
        started = true;
      }
    }

    if (!started) {
      strInterval += " " + milis + "ms";
    }

    return strInterval;
  }

  static calcIndexPercentage(part: number, total: number) {
    let fieldText = "";
    let perc = 0;
    if (part > total) {
      fieldText = " MAIOR"
      perc = (part/total) * 100;
    } else {
      fieldText = " MENOR"
      perc = (1 - (part/total)) * 100;
    }
    return `${perc.toLocaleString('pt-br', {maximumFractionDigits: 1}) + "%"}fieldText`
  }

  static minicardDeltaPercentage(val1: number, val2: number) {
    var fieldText = "";
    var result = Math.abs(val1 - val2);
    if (val1 > val2) {
      fieldText = " PONTOS PERCENTUAIS A MAIS"
    } else if (val1 < val2) {
      fieldText = " PONTOS PERCENTUAIS A MENOS"
    } else {
      return "";  //igual
    }
    
    return `${NumberTransformService.formatNumber({valor: result, formato: "real", casasDecimais: 1} as IFormatOptions)}${fieldText}`
  }

  // static getAbsoluteValue(value: number) { return Math.abs(value); }
}

export default function({ app }: any, inject: any) {
  inject('getNumberTransformService', NumberTransformService)
}
export { NumberTransformService }