import { TextTransformService } from "../utils/service/singleton/textTransform"
import { describe, test, expect } from "vitest"
import { setup} from "@nuxt/test-utils"

describe("TextTransformService", async () => {
  await setup({
    
  })
  const textTransformService = new TextTransformService()
  test("Retorna vazio quando o template é nulo", () => {
    const result = textTransformService.replaceArgs(null, null)
    expect(result).toEqual("")
  })

  test("Retorna string válida", () => {
    const result = textTransformService.replaceArgs(
      "Teste {0}: {1}",
      [1, "param"]
    )
    expect(result).toEqual("Teste 1: param")
  })

  test("Testa avaliação de interpolação sem estrutura de yaml informada", () => {
    const result = textTransformService.applyInterpol(null, {}, null)
    expect(result).toEqual("")
  })

  test("Testa avaliação de interpolação com texto fixo", () => {
    const struct = { fixed: "Teste" }

    const result = textTransformService.applyInterpol(struct, {}, null)
    expect(result).toEqual("Teste")
  })

  test("Testa avaliação de interpolação com função de interpolação sem parâmetros", () => {
    const interpolFunctions = {
      customize: () => { return "xpto" }
    }
    const struct = {
      template: "Teste {0}",
      args: [
        { function: "customize" }
      ]
    }
    const result = textTransformService.applyInterpol(struct, {}, interpolFunctions)
    expect(result).toEqual("Teste xpto")
  })

  test("Testa avaliação de interpolação com função de interpolação com parâmetros", () => {
    const interpolFunctions = {
      customize: (a: any, b: any) => { return a.toString() + b.toString() }
    }
    const base_object = { vl_indicador: "234" }
    const struct = {
      template: "Teste {0}",
      args: [
        {
          function: "customize",
          fn_args: [
            { fixed: "1" },
            { named_prop: "vl_indicador" }
          ]
        }
      ]
    }
    const result = textTransformService.applyInterpol(struct, {}, interpolFunctions, base_object)
    expect(result).toEqual("Teste 1234")
  })

  // test("Testa avaliação de interpolação com função geral com parâmetros", () => {
  //   wrapper.vm.customFunctions = { customize: (a, b) => { return a.toString() + b.toString() } }
  //   const base_object = { vl_indicador: "234" }
  //   const struct = {
  //     template: "Teste {0}",
  //     args: [
  //       {
  //         function: "customize",
  //         fn_args: [
  //           { fixed: "1" },
  //           { named_prop: "vl_indicador" }
  //         ]
  //       }
  //     ]
  //   }

  //   wrapper.vm.$textTransformService.context = wrapper.vm
  //   const result = textTransformService.applyInterpol(struct, {}, wrapper.vm.customFunctions, base_object)
  //   expect(result).toEqual("Teste 1234")
  // })

  test("Testa falha na passagem de named_prop sem envio de base_object", () => {
    const interpolFunctions = { customize: (a: any, b: any) => { return (a ? a.toString() : a) + (b ? b.toString() : b) } }
    // const base_object = { vl_indicador: "234" }
    const struct = {
      template: "Teste {0}",
      args: [
        {
          function: "customize",
          fn_args: [
            { fixed: "1" },
            { named_prop: "vl_indicador" }
          ]
        }
      ]
    }

    const result = textTransformService.applyInterpol(struct, {}, interpolFunctions )
    expect(result).toEqual("Teste 1undefined")
  })

  test("Testa avaliação de interpolação com parâmetros diretos", () => {
    const base_object = { vl_indicador: "234" }
    const struct = {
      template: "Teste {0}: {1}",
      args: [
        { value: 1 },
        { named_prop: "vl_indicador" }
      ]
    }

    const result = textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual("Teste 1: 234")
  })

  test("Testa avaliação de interpolação com parâmetros com link", () => {
    const base_object = { vl_indicador: "234" }
    const struct = {
      template: "Teste link: {0}",
      args: [
        { link: "teste.mpt.mp.br", text: "test site" }
      ]
    }

    const result = textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual("Teste link: <a href='teste.mpt.mp.br'>test site</a>")
  })

  test("Testa avaliação de interpolação com valor default", () => {
    const base_object = { vl_indicador: "234" }
    const struct = {
      template: "Teste {0}",
      args: [
        { named_prop: "nu_competencia", default: "Sem Registros" }
      ]
    }

    const result = textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual("Teste Sem Registros")
  })

  test("Testa avaliação de interpolação com valor formatado", () => {
    const base_object = { vl_indicador: 0.234 }
    const struct = {
      template: "Teste {0}",
      args: [
        { named_prop: "vl_indicador", format: "porcentagem", precision: 2, multiplier: 100 }
      ]
    }

    const result = textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual("Teste 23,40<span>%</span>")
  })

  // test("Testa avaliação de interpolação com valor requerido não preenchido", () => {
  //   const base_object = { vl_indicador: 0.234 }
  //   const struct = {
  //     template: "Teste {0}",
  //     args: [
  //       { named_prop: "nu_competencia", required: true }
  //     ]
  //   }
  //   const cbInvalidate = () => { return "requerido" }
  //   const result = textTransformService.applyInterpol(struct, {}, null, base_object, cbInvalidate)
  //   expect(result).toEqual("requerido")
  // })


})
