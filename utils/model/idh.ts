interface IIDH {
  cap: number | null
  name: string
  description: string
}

export class IDH{
  // Adicionando uma assinatura de índice para permitir acesso dinâmico
  [index: string]: (...args: any[]) => void

  getLevels() {
    const fixedLevels: IIDH[] = [
      { cap: 0.5, name: "Muito baixo", description: "(Abaixo de 0,500)" },
      { cap: 0.6, name: "Baixo", description: "(0.500 a 0.599)" },
      { cap: 0.7, name: "Médio", description: "(0.600 a 0.699)" },
      { cap: 0.8, name: "Alto", description: "(0.700 a 0.799)" },
      { cap: null, name: "Muito alto", description: "(0.800 ou superior)" }
    ]
    return fixedLevels
  }

  // Funções migradas de contextos de componentes (customFunctions e methods)
  calcClassIdh(idhValue: number, showIdh: boolean = false, showParentheses: boolean = false, letterCaption: boolean = true) {
    const prepend: string = `${showIdh ? idhValue + " " : ""}${showParentheses ? " (" : ""}`
    const append: string = `${showParentheses ? ")" : ""}`

    const allLevels: IIDH[] = this.getLevels()
    for (const level of allLevels) {
      if (level.cap && idhValue < level.cap) {
        return `${prepend}${letterCaption ? level.name : level.name.toLowerCase()}${append}`
      }
    }
    return `${prepend}${letterCaption ? allLevels[allLevels.length - 1].name : allLevels[allLevels.length - 1].name.toLowerCase()}${append}`
  }

  getClassIdh(idhValue: number) {
    if (!idhValue) return ""
    const allLevels: IIDH[] = this.getLevels()
    for (const level of allLevels) {
      if (level.cap && idhValue < level.cap) {
        return level.description
      }
    }
    return allLevels[allLevels.length - 1].description
  }

}
