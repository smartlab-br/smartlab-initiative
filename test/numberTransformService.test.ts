import { NumberTransformService } from "../utils/service/singleton/numberTransform"
import { describe, test, expect } from "vitest"
import { setup} from "@nuxt/test-utils"

describe("NumberTransformService", async () => {
  await setup({
    
  })

  test("Formata um inteiro corretamente", () => {
    expect(NumberTransformService.formatNumber("12.34", "inteiro", 0, null)).toEqual("12")
  })

  test("Formata um inteiro a partir de um float com aproximação para cima", () => {
    expect(NumberTransformService.formatNumber("12.89", "inteiro")).toEqual("13")
  })

  test("Formata um real corretamente", () => {
    expect(NumberTransformService.formatNumber("12.34", "real")).toEqual("12,3")
  })

  test("Formata um real com precisão definida corretamente", () => {
    expect(NumberTransformService.formatNumber("12.345678", "real", 3)).toEqual("12,346")
  })

  test("Formata um percentual corretamente", () => {
    expect(NumberTransformService.formatNumber("12.34", "porcentagem")).toEqual("12,3<span>%</span>")
  })

  test("Formata um percentual com precisão definida corretamente", () => {
    expect(NumberTransformService.formatNumber("12.345678", "porcentagem", 3)).toEqual("12,346<span>%</span>")
  })

  test("Formata um percentual com multiplicador corretamente", () => {
    expect(NumberTransformService.formatNumber("0.1234", "porcentagem", null, 100)).toEqual("12,3<span>%</span>")
  })

  test("Formata um percentual com multiplicador e precisão definidos corretamente", () => {
    expect(NumberTransformService.formatNumber("0.12345678", "porcentagem", 3, 100)).toEqual("12,346<span>%</span>")
  })

  test("Formata um monetário corretamente", () => {
    expect(NumberTransformService.formatNumber("12345.678", "monetario")).toEqual("<span>R$</span>12.345,7")
  })

  test("Formata um monetário com precisão definida corretamente", () => {
    expect(NumberTransformService.formatNumber("12345.678", "monetario", 2)).toEqual("<span>R$</span>12.345,68")
  })

  test("Formatação padrão", () => {
    expect(NumberTransformService.formatNumber("12345.678")).toEqual("12.345,7")
  })

  test("Texto padrão quando valor é nule deve ser apenas '-'", () => {
    expect(NumberTransformService.formatNumber(null)).toEqual("-")
  })

  test("Texto padrão quando valor é NaN deve ser apenas '-'", () => {
    expect(NumberTransformService.formatNumber(NaN)).toEqual("-")
  })

  test("Quando valor não é numérico retorna o próprio valor", () => {
    expect(NumberTransformService.formatNumber("teste")).toEqual("teste")
  })

  test("Formata um número com collapse (mil)", () => {
    expect(NumberTransformService.formatNumber("12345.678", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>mil</span>")
  })

  test("Formata um número com collapse (milhão)", () => {
    expect(NumberTransformService.formatNumber("12345678.901", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>mi</span>")
  })

  test("Formata um número com collapse (bilhão)", () => {
    expect(NumberTransformService.formatNumber("12345678901.234", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>bi</span>")
  })

  test("Formata um número com collapse (trilhão)", () => {
    expect(NumberTransformService.formatNumber("12345678901234.567", "real", 2, 1, {formato: "real", casasDecimais:1, uiTags: true})).toEqual("12,3<span>tri</span>")
  })


})
