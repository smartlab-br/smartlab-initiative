export class NumberTransformService {
  constructor() {}
  
  formatNumber(valor, formato, casasDecimais, multiplier = 1, collapse = null, signed = false, uiTags = true){

    if (isNaN(valor)){
      return valor;
    }
    
    if (formato == 'cep'){
      valor = ('00000000' + valor.toString()).slice(-8);
      valor = valor.slice(0,5) + '-' + valor.slice(-3);
      return valor;
    }

    if (formato == 'dataDMY'){ //timestamp to dd/MM/yyyy
      valor = new Date(valor).toISOString().substring(0,10);
      valor = valor.substring(8,10) + '/' + valor.substring(5,7) + '/' + valor.substring(0,4)
      return valor;
    }

    if (formato == 'dataYMD'){ //timestamp to yyyy-MM-dd
      valor = new Date(valor).toISOString().substring(0,10);
      return valor;
    }

    if (multiplier === null || multiplier === undefined) {
      multiplier = 1;
    }

    if (signed === null || signed === undefined) {
      signed = false;
    }

    if (uiTags === null || uiTags === undefined) {
      uiTags = true;
    }

    var openUiTags = '';
    var closeUiTags = '';

    let unitPrefix = '';

    if(valor === null || valor === undefined){
      return "-"; 
    }
    valor = parseFloat(valor) * multiplier;
    
    // Verifica a ordem de grandeza do número, para poder reduzir o tamanho da string
    let collapseSuffix = '';
    let magnitude = 0;
    if (collapse) {
      magnitude = Math.floor((Math.floor(Math.abs(valor)).toString().length - 1)/3);

      if (magnitude > 0) {
        if ((collapse.uiTags === null || collapse.uiTags === undefined || collapse.uiTags) && uiTags) {
          uiTags = true;
        } else {
          uiTags = false;
        }

      }

      if (uiTags) {
        openUiTags = '<span>';
        closeUiTags = '</span>';
      }

      valor = valor / Math.pow(10, magnitude * 3);
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
        casasDecimais = collapse.casasDecimais ? collapse.casasDecimais : null;
        formato = collapse.format ? collapse.format : null;
      }
      unitPrefix = formato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
      // if (magnitude > 0) {
      //   unitPrefix = "&plusmn;" + unitPrefix;
      // }
    } else {
      if (uiTags) {
        openUiTags = '<span>';
        closeUiTags = '</span>';
      }

      // Define um prefixo de unidade
      unitPrefix = formato == 'monetario' ? openUiTags + "R$" + closeUiTags : '';
      if (signed && valor > 0) {
        unitPrefix = "+";
      }
    }
    
    casasDecimais = (casasDecimais !== undefined && casasDecimais !== null) ? casasDecimais : 1;
    // Define a configuração do locale
    let localeConfig = {
      maximumFractionDigits: casasDecimais
    }


    if (formato == 'inteiro') {
      localeConfig.maximumFractionDigits = 0;
    } else {
      localeConfig.minimumFractionDigits = localeConfig.maximumFractionDigits;
    }

    valor = valor.toLocaleString('pt-br', localeConfig);

    //Retira decimais quando zerados
    valor = valor.endsWith("," + "0".repeat(casasDecimais)) ? valor.replace("," + "0".repeat(casasDecimais),""): valor;

    // Substitui o collapseConfig apenas na porcentagem
    if (formato == 'porcentagem') collapseSuffix = openUiTags + "%" + closeUiTags;
    return unitPrefix + valor + collapseSuffix;
  }

  getPaceString(interval, inverse = false) {
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

  calcIndexPercentage(part, total) {
    let fieldText = "";
    let perc = 0;
    if (part > total) {
      fieldText = " MAIOR"
      perc = (part/total) * 100;
    } else {
      fieldText = " MENOR"
      perc = (1 - (part/total)) * 100;
    }
    
    perc = perc.toLocaleString('pt-br', {maximumFractionDigits: 1}) + "%";
    return perc + fieldText;
  }

  minicardDeltaPercentage(val1, val2) {
    var fieldText = "";
    var result = Math.abs(val1 - val2);
    if (val1 > val2) {
      fieldText = " PONTOS PERCENTUAIS A MAIS"
    } else if (val1 < val2) {
      fieldText = " PONTOS PERCENTUAIS A MENOS"
    } else {
      return "";  //igual
    }
    
    result = NumberTransformService.formatNumber(result, "real", 1);
    return result + fieldText;
  }

  getAbsoluteValue(value) { return Math.abs(value); }
}
