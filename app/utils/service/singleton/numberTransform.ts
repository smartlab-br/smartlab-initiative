export class NumberTransformService {
  // Adicionando uma assinatura de índice para permitir acesso dinâmico
  [index: string]: (...args: any[]) => void

  formatNumber(valor: number | string | null | undefined,
    formato: string | null = null,
    casasDecimais: number | null = null,
    multiplier: number | null = 1,
    collapse: {formato?: string, casasDecimais?: number, uiTags?: boolean} | null = null,
    signed: boolean = false,
    uiTags: boolean = true,
    null_value: number | string | null = null
  ): string {

    if (Number.isNaN(valor) || valor === null || valor === undefined || valor === "NaN" || valor === "null" || valor === "undefined") {
      if (null_value) {
        return String(null_value)
      }
      return "-"
    // Se valor não númérico retorna valor
    } else if (isNaN(valor as number)) {
      return String(valor)
    }
    valor = valor as number

    if (formato == "cep"){
      const strValor: string = (`00000000${valor}`).slice(-8)
      return `${strValor.slice(0,5)}-${strValor.slice(-3)}`
    }

    switch (formato) {
    case "dataDMY": {
      const strValor = new Date(valor.toString()).toISOString().substring(0,10)
      return `${strValor.substring(8,10)}/${strValor.substring(5,7)}/${strValor.substring(0,4)}`
    }
    case "dataYMD": {
      return new Date(valor.toString()).toISOString().substring(0,10)  
    }
    }
    
    multiplier = multiplier ? multiplier : 1
    uiTags = (uiTags === null || uiTags === undefined) ? true : uiTags
    
    let openUiTags = ""
    let closeUiTags = ""
    let unitPrefix = ""
    
    let curVal: number = valor * multiplier
    let curCasasDecimais: number | null = casasDecimais
    let curFormato: string | null = formato
    
    // Verifica a ordem de grandeza do número, para poder reduzir o tamanho da string
    let collapseSuffix = ""
    let magnitude = 0
    if (collapse) {
      magnitude = Math.floor((Math.floor(Math.abs(curVal)).toString().length - 1)/3)

      if (magnitude > 0) {
        if ((collapse.uiTags === null || collapse.uiTags === undefined || collapse.uiTags) && uiTags) {
          uiTags = true
        }
      }

      if (uiTags) {
        openUiTags = "<span>"
        closeUiTags = "</span>"
      }

      curVal = curVal / Math.pow(10, magnitude * 3)
      // Define o termo usado no final da string
      switch (magnitude) {
      case 1:
        collapseSuffix = openUiTags + "mil" + closeUiTags
        break
      case 2:
        collapseSuffix = openUiTags + "mi" + closeUiTags
        break
      case 3:
        collapseSuffix = openUiTags + "bi" + closeUiTags
        break
      case 4:
        collapseSuffix = openUiTags + "tri" + closeUiTags
        break
      }

      // Se contrair o dado, ver o formato resultante
      if (magnitude > 0) {
        curCasasDecimais = collapse.casasDecimais ? collapse.casasDecimais : null
        curFormato = collapse.formato ? collapse.formato : null
      }
      unitPrefix = curFormato == "monetario" ? openUiTags + "R$" + closeUiTags : ""
      // if (magnitude > 0) {
      //   unitPrefix = "&plusmn;" + unitPrefix;
      // }
    } else {
      if (uiTags) {
        openUiTags = "<span>"
        closeUiTags = "</span>"
      }

      // Define um prefixo de unidade
      unitPrefix = formato == "monetario" ? openUiTags + "R$" + closeUiTags : ""
      if (signed && curVal > 0) {
        unitPrefix = "+"
      }
    }
    
    curCasasDecimais = (curCasasDecimais) ? curCasasDecimais : 1
    // Define a configuração do locale
    const localeConfig: Intl.NumberFormatOptions = {maximumFractionDigits: curCasasDecimais}

    if (curFormato == "inteiro") {
      localeConfig.maximumFractionDigits = 0
    } else {
      localeConfig.minimumFractionDigits = localeConfig.maximumFractionDigits
    }

    let strVal: string = curVal.toLocaleString("pt-br", localeConfig)

    //Retira decimais quando zerados
    strVal = strVal.endsWith("," + "0".repeat(curCasasDecimais)) ? strVal.replace("," + "0".repeat(curCasasDecimais),""): strVal

    // Substitui o collapseConfig apenas na porcentagem
    if (curFormato == "porcentagem") collapseSuffix = openUiTags + "%" + closeUiTags
    return `${unitPrefix}${strVal}${collapseSuffix}`
  }

  getPaceString(interval: number, inverse: boolean = false) {
    // console.log(interval);
    if (inverse){
      interval = 1 / interval
    }
    const days=Math.floor((interval/(1000*60*60*24)))
    let tmpInterval = interval - days*1000*60*60*24
    const hours = Math.floor(tmpInterval/(1000*60*60))
    tmpInterval -= hours*1000*60*60
    const minutes = Math.floor(tmpInterval/(1000*60))
    tmpInterval -= minutes*1000*60
    const seconds = Math.floor(tmpInterval/(1000))
    tmpInterval -= seconds*1000
    const milis = Math.floor(tmpInterval)

    let strInterval = ""
    let started = false
    if (days > 0) {
      strInterval += " " + days + "d"
      started = true
    }
    if (started) {
      strInterval += " " + hours + "h"
    } else {
      if (hours > 0) {
        strInterval += " " + hours + "h"
        started = true
      }
    }

    if (started) {
      strInterval += " " + minutes + "m"
    } else {
      if (minutes > 0) {
        strInterval += " " + minutes + "m"
        started = true
      }
    }
    
    if (started) {
      strInterval += " " + seconds + "s"
    } else {
      if (seconds > 0) {
        strInterval += " " + seconds + "s"
        started = true
      }
    }

    if (!started) {
      strInterval += " " + milis + "ms"
    }

    return strInterval
  }

  calcIndexPercentage(part: number, total: number) {
    let fieldText = ""
    let perc = 0
    if (part > total) {
      fieldText = " MAIOR"
      perc = (part/total) * 100
    } else {
      fieldText = " MENOR"
      perc = (1 - (part/total)) * 100
    }
    return `${perc.toLocaleString("pt-br", {maximumFractionDigits: 1}) + "%"}${fieldText}`
  }

  minicardDeltaPercentage(val1: number, val2: number) {
    let fieldText = ""
    const result = Math.abs(val1 - val2)
    if (val1 > val2) {
      fieldText = " PONTOS PERCENTUAIS A MAIS"
    } else if (val1 < val2) {
      fieldText = " PONTOS PERCENTUAIS A MENOS"
    } else {
      return ""  //igual
    }
    
    return `${this.formatNumber(result,"real", 1)}${fieldText}`
  }

  calcProportionSalary(value: number, salary: number) {
    const fieldText: string = " salários mínimos, à época"
    const proportion = value/salary
    
    const proportionText = proportion.toLocaleString("pt-br", {maximumFractionDigits: 2})
    return proportionText + fieldText
  }

  // static getAbsoluteValue(value: number) { return Math.abs(value); }
}