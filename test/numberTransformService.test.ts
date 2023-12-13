import { NumberTransformService } from "../utils/service/singleton/numberTransform"
import { describe, test, expect } from "vitest"
import { setup} from "@nuxt/test-utils"

describe("NumberTransformService", async () => {
  await setup({
    
  })
  const numberTransformService = new NumberTransformService()
  test("Formata um inteiro corretamente", () => {
    expect(numberTransformService.formatNumber("12.34", "inteiro", 0, null)).toEqual("12")
  })

  test("Formata um inteiro a partir de um float com aproximação para cima", () => {
    expect(numberTransformService.formatNumber("12.89", "inteiro")).toEqual("13")
  })

  test("Formata um real corretamente", () => {
    expect(numberTransformService.formatNumber("12.34", "real")).toEqual("12,3")
  })

  test("Formata um real com precisão definida corretamente", () => {
    expect(numberTransformService.formatNumber("12.345678", "real", 3)).toEqual("12,346")
  })

  test("Formata um percentual corretamente", () => {
    expect(numberTransformService.formatNumber("12.34", "porcentagem")).toEqual("12,3<span>%</span>")
  })

  test("Formata um percentual com precisão definida corretamente", () => {
    expect(numberTransformService.formatNumber("12.345678", "porcentagem", 3)).toEqual("12,346<span>%</span>")
  })

  test("Formata um percentual com multiplicador corretamente", () => {
    expect(numberTransformService.formatNumber("0.1234", "porcentagem", null, 100)).toEqual("12,3<span>%</span>")
  })

  test("Formata um percentual com multiplicador e precisão definidos corretamente", () => {
    expect(numberTransformService.formatNumber("0.12345678", "porcentagem", 3, 100)).toEqual("12,346<span>%</span>")
  })

  test("Formata um monetário corretamente", () => {
    expect(numberTransformService.formatNumber("12345.678", "monetario")).toEqual("<span>R$</span>12.345,7")
  })

  test("Formata um monetário com precisão definida corretamente", () => {
    expect(numberTransformService.formatNumber("12345.678", "monetario", 2)).toEqual("<span>R$</span>12.345,68")
  })

  test("Formatação padrão", () => {
    expect(numberTransformService.formatNumber("12345.678")).toEqual("12.345,7")
  })

  test("Texto padrão quando valor é nule deve ser apenas '-'", () => {
    expect(numberTransformService.formatNumber(null)).toEqual("-")
  })

  test("Texto padrão quando valor é NaN deve ser apenas '-'", () => {
    expect(numberTransformService.formatNumber(NaN)).toEqual("-")
  })

  test("Quando valor não é numérico retorna o próprio valor", () => {
    expect(numberTransformService.formatNumber("teste")).toEqual("teste")
  })

  test("Formata um número com collapse (mil)", () => {
    expect(numberTransformService.formatNumber("12345.678", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>mil</span>")
  })

  test("Formata um número com collapse (milhão)", () => {
    expect(numberTransformService.formatNumber("12345678.901", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>mi</span>")
  })

  test("Formata um número com collapse (bilhão)", () => {
    expect(numberTransformService.formatNumber("12345678901.234", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>bi</span>")
  })

  test("Formata um número com collapse (trilhão)", () => {
    expect(numberTransformService.formatNumber("12345678901234.567", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>tri</span>")
  })


})
