import { TooltipBuildingService } from "../utils/service/singleton/tooltipBuilding"
import { describe, test, expect } from "vitest"

describe("TooltipBuildingService", () => {
  const remove_list = ["remove", "delete"]

  test("Remove textos de uma lista de labels", () => {
    const label = [
      "testeremovedelete",
      "testeremove2",
      "testedelete3",
      "teste4"
    ]

    const result = TooltipBuildingService.removeFromLabel(label, remove_list)
    expect(result).toEqual(["teste", "teste2", "teste3", "teste4"])
  })

  test("Remove textos de uma lista de labels", () => {
    const label = "testeremovedelete"

    const result = TooltipBuildingService.removeFromLabel(label, remove_list)
    expect(result).toEqual("teste")
  })

  test("Monta um default quando não há indicação dos campos", () => {
    const indicador = { cd_indicador: 1, nu_competencia: 2099, vl_indicador: 123.45 }

    const result = TooltipBuildingService.defaultTooltip(indicador, null, null, remove_list)
    expect(result).toEqual("Tooltip!")
  })

  test("Monta um default tooltip com valor único", () => {
    const indicador = { cd_indicador: 1, nu_competencia: 2020, vl_indicador: 123.45 }
    const vals = [{ text: "Indicador", value: "cd_indicador" },
      { text: "Ano", value: "nu_competencia" },
      { text: "Valor", value: "vl_indicador" }]

    const result = TooltipBuildingService.defaultTooltip(indicador, null, vals, remove_list)
    expect(result).toEqual(
      "<p class='headline-obs'><b>1</b></p><hr class='tooltip_divider'>" +
      "<table width='100%' style='max-width:350px'>" +
      "<tr style='vertical-align:top'>" +
      "<td class='font-weight-bold'>Ano:</td><td class='text-xs-right'>2020</td></tr>" +
      "<tr style='vertical-align:top'>" +
      "<td class='font-weight-bold'>Valor:</td><td class='text-xs-right'>123.45</td>" +
      "</tr></table>"
    )
  })

  test("Monta um default tooltip com array de valores", () => {
    const indicador = { cd_indicador: 1, lista: [1, 2], nu_competencia: 2099, vl_indicador: 123.45 }
    const vals = [
      { text: "Código", value: "cd_indicador" },
      { text: "Ano", value: "nu_competencia" },
      { text: "Valor", value: "vl_indicador" },
      { text: "Lista", value: "lista" }
    ]

    const result: any = TooltipBuildingService.defaultTooltip(indicador, null, vals, remove_list)
    expect(result).toEqual(
      "<p class='headline-obs'><b>1</b></p><hr class='tooltip_divider'><table width='100%' style='max-width:350px'>" +
      "<tr style='vertical-align:top'><td class='font-weight-bold'>Ano:</td><td class='text-xs-right'>2099</td></tr>" +
      "<tr style='vertical-align:top'><td class='font-weight-bold'>Valor:</td><td class='text-xs-right'>123.45</td></tr>" +
      "<tr style='vertical-align:top'><td class='font-weight-bold'>Lista:</td><td class='text-xs-right'>1, 2</td></tr>" +
      "</table>"
    )
  })

})
