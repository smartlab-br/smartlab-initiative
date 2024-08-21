import { Indicators } from "./../utils/model/indicators"
import { describe, test, expect, vi } from "vitest"
import { setup} from "@nuxt/test-utils"

describe("IndicatorsModel", async () => {
  await setup({
    
  })
  const indicators = new Indicators()

  test("Retorna vazio quando nenhuma estrutura é passada para pegar um atributo de um indicador", () => {
    const result = indicators.getAttributeFromIndicatorInstance(null, {})
    expect(result).toEqual(null)
  })

  test("Retorna vazio quando nenhum indicador é passado para pegar um atributo", () => {
    const result = indicators.getAttributeFromIndicatorInstance({}, null)
    expect(result).toEqual(null)
  })

  test("Retorna o valor padrão de um atributo", () => {
    const result = indicators.getAttributeFromIndicatorInstance({ default: "default" }, null)
    expect(result).toEqual("default")
  })

  test("Verifica correta obtenção de atributo nomeado", () => {
    const indicador = { vl_indicador: 123.45 }
    const structure = { named_prop: "vl_indicador" }
    const result = indicators.getAttributeFromIndicatorInstance(structure, indicador)
    expect(result).toEqual(123.45)
  })

  test("Verifica correta aplicação de função na obtenção de atributo", () => {
    const indicador = { vl_indicador: 123.45 }
    const structure = {
      function: "calc_addition",
      fn_args: [
        { fixed: 2 },
        { named_prop: "vl_indicador" }
      ]
    }
    const result = indicators.getAttributeFromIndicatorInstance(structure, indicador)
    expect(result).toEqual(125.45)
  })

  test("Formata adequadamente um atributo de um indicador", () => {
    const indicador = { vl_indicador: 123.45 }
    const structure = { named_prop: "vl_indicador", format: "inteiro" }
    const result = indicators.getAttributeFromIndicatorInstance(structure, indicador)
    expect(result).toEqual("123")
  })

  test("Invalida e substitui por default um atributo requerido de um indicador, quando não encontrado", () => {

    const cbInvalid = vi.fn()
    const structure = { default: "default", required: true }

    const result = indicators.getAttributeFromIndicatorInstance(structure, null, cbInvalid)
    expect(result).toEqual("default")
    expect(cbInvalid).toHaveBeenCalled()
  })

  test("Invalida e retorna Sem Registros um atributo requerido de um indicador, quando não encontrado e na ausência de valor default", () => {

    const cbInvalid = vi.fn()
    const structure = { required: true }

    const result = indicators.getAttributeFromIndicatorInstance(structure, null, cbInvalid)
    expect(result).toEqual("Sem Registros")
    expect(cbInvalid).toHaveBeenCalled()
  })

  test("Combina indicadores de acordo com a estrutura", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 }
    ]
    const structure = [
      {
        id: "cmb",
        desc: "combined",
        year: 2099,
        function: "calc_percentage",
        fn_args: [
          { id: "1", year: 2099 },
          { id: "1", year: 2047 }
        ]
      }
    ]

    const result = indicators.combineIndicators(ds, structure)
    expect(result).toEqual([
      {
        cd_indicador: "cmb",
        ds_indicador: "combined",
        nu_competencia: 2099,
        vl_indicador: 55.55555555555556,
        ds_agreg_primaria: undefined,
        ds_agreg_secundaria: undefined,
        ds_indicador_radical: "combined"
      }
    ])
  })

  test("Confirma que um determinado indicador é o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = indicators.isMaxOnSlice(ds, ds[0], "nu_competencia")
    expect(result).toEqual(true)
  })

  test("Confirma que um determinado indicador é o mínimo do dataset de acordo com um campo, dentre os que tem o mesmo id", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: "1", nu_competencia: 2136, vl_indicador: 2.7 }
    ]

    const result = indicators.isMinOnSlice(ds, ds[1], "nu_competencia")
    expect(result).toEqual(true)
  })

  test("Rejeita determinado indicador como o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = indicators.isMaxOnSlice(ds, ds[1], "nu_competencia")
    expect(result).toEqual(false)
  })

  test("Fatia corretamente o dataset, por ano determinado", () => {

    const structure = { year: 2047 }
    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: "2", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "2", nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = indicators.slice(structure, ds)
    expect(result).toEqual([
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: "2", nu_competencia: 2047, vl_indicador: 1 }
    ])
  })

  test("Fatia corretamente o dataset pelo max", () => {

    const structure = { year: "max" }
    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: "2", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "2", nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = indicators.slice(structure, ds)
    expect(result).toEqual([
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "2", nu_competencia: 2099, vl_indicador: 1.8 }
    ])
  })

  test("Transforma corretamente um dataset em um array de valores", () => {

    const args = [
      { id: "1", year: 2099, named_prop: "vl_indicador" },
      { named_prop: "vl_indicador" },
      { link: "test.mpt.mp.br", text: "teste" }
    ]
    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: "2", nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: "2", nu_competencia: 2047, vl_indicador: 1 }
    ]
    const invalidate = vi.fn()

    const result = indicators.indicatorsToValueArray(args, ds, invalidate)
    expect(result).toEqual([
      1.8,
      1.8,
      "<a href='test.mpt.mp.br'>teste</a>"
    ])
  })

  test("Verifica ordenação de dataset", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const result = indicators.sortObject(ds, "nu_competencia")

    expect(result).toEqual([
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9 },
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45 }
    ])
  })

  test("Verifica aplicação de melt", () => {

    const ds = [
      { cd_indicador: "1", nu_competencia: 2099, vl_indicador: 123.45, rank_br: 1 },
      { cd_indicador: "1", nu_competencia: 2047, vl_indicador: 678.9, rank_br: 987 }
    ]
    const value_field = "valor"
    const layer_fields = ["vl_indicador", "rank_br"]
    const layer_field = "subindicador"
    const label_fields = ["valor", "ranking"]
    const label_field = "label"

    const result = indicators.melt(
      ds, value_field, layer_fields, layer_field,
      label_fields, label_field, null
    )

    expect(result).toEqual([
      {
        cd_indicador: "1",
        label: "valor",
        nu_competencia: 2099,
        rank_br: 1,
        subindicador: "vl_indicador",
        valor: 123.45,
        vl_indicador: 123.45
      },
      {
        cd_indicador: "1",
        label: "ranking",
        nu_competencia: 2099,
        rank_br: 1,
        subindicador: "rank_br",
        valor: 1,
        vl_indicador: 123.45
      },
      {
        cd_indicador: "1",
        label: "valor",
        nu_competencia: 2047,
        rank_br: 987,
        subindicador: "vl_indicador",
        valor: 678.9,
        vl_indicador: 678.9
      },
      {
        cd_indicador: "1",
        label: "ranking",
        nu_competencia: 2047,
        rank_br: 987,
        subindicador: "rank_br",
        valor: 987,
        vl_indicador: 678.9
      }
    ])
  })

})
