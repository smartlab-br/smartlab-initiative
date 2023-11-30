import { ColorsService } from "./../utils/service/singleton/colorsService"
import { describe, test, expect } from "vitest"
import { setup} from "@nuxt/test-utils"

describe("ColorsService", async () => {
  await setup({
    
  })

  test("Pega corretamente a escala categórica ascendente padrão", () => {
    expect(ColorsService.getColorScale()).toEqual(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"])
  })

  test("Pega corretamente a escala categórica descendente padrão", () => {
    expect(ColorsService.getColorScale(null, null, "desc")).toEqual(["#ffed6f", "#ccebc5", "#bc80bd", "#d9d9d9", "#fccde5", "#b3de69", "#fdb462", "#80b1d3", "#fb8072", "#bebada", "#ffffb3", "#8dd3c7"])
  })

  test("Retorna corretamente uma escala categórica ascendente padrão e ignora os níveis definidos", () => {
    expect(ColorsService.getColorScale(null, null, "asc", 6)).toEqual(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"])
  })

  test("Pega corretamente a escala divergente ascendente padrão", () => {
    expect(ColorsService.getColorScale(null, "divergent")).toEqual(["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"])
  })

  test("Pega corretamente a escala divergente descendente padrão", () => {
    expect(ColorsService.getColorScale(null, "divergent", "desc")).toEqual(["#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#fee090", "#fdae61", "#f46d43", "#d73027"])
  })

  test("Pega corretamente a escala divergente ascendente padrão com níveis definidos", () => {
    expect(ColorsService.getColorScale(null, "divergent", "asc", 10)).toEqual(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"])
  })

  test("Pega corretamente a escala de única cor ascendente padrão", () => {
    expect(ColorsService.getColorScale(null, "singleHue")).toEqual(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"])
  })

  test("Pega corretamente a escala de única cor descendente padrão", () => {
    expect(ColorsService.getColorScale(null, "singleHue", "desc")).toEqual(["#084594", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"])
  })

  test("Pega corretamente a escala de única cor ascendente padrão com níveis definidos", () => {
    expect(ColorsService.getColorScale(null, "singleHue", "asc", 4)).toEqual(["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"])
  })

  test("Pega corretamente a escala cor definida ascendente", () => {
    expect(ColorsService.getColorScale("RdYlGn", "divergent")).toEqual(["#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"])
  })

  test("Pega corretamente a escala cor definida descendente", () => {
    expect(ColorsService.getColorScale("RdYlGn", "divergent", "desc")).toEqual(["#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#fee08b", "#fdae61", "#f46d43", "#d73027"])
  })

  test("Pega corretamente a escala de única cor ascendente definida com níveis determinados", () => {
    expect(ColorsService.getColorScale("RdYlGn", "divergent", "asc", 10)).toEqual(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"])
  })

})
