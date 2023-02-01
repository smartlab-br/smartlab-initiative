import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

import { TextTransformService } from '~/plugins/service/singleton/textTransformService'
import { ObjectTransformService } from '~/plugins/service/singleton/objectTransformService'
import { NumberTransformService } from '~/plugins/service/singleton/numberTransformService'
// import { ViewConfReader } from '~/plugins/mixins/service/viewConfReader.js'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

Vue.use(Vuetify)

require('../../setup.js')

// Sets the mixin in the Vue instance
Vue.prototype.$textTransformService = new TextTransformService()
Vue.prototype.$numberTransformService = new NumberTransformService()
Vue.prototype.$objectTransformService = new ObjectTransformService()
// Vue.use(ViewConfReader)

// Tests
describe('TextManager', () => {
  test('Retorna vazio quando o template é nulo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const result = wrapper.vm.$textTransformService.replaceArgs(null, null)
    expect(result).toEqual('')
  })

  test('Retorna string válida', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const result = wrapper.vm.$textTransformService.replaceArgs(
      'Teste {0}: {1}',
      [1, 'param']
    )
    expect(result).toEqual('Teste 1: param')
  })

  test('Testa avaliação de interpolação sem estrutura de yaml informada', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const result = wrapper.vm.$textTransformService.applyInterpol(null, {}, null)
    expect(result).toEqual('')
  })

  test('Testa avaliação de interpolação com texto fixo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const struct = { fixed: 'Teste' }

    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, null)
    expect(result).toEqual('Teste')
  })

  test('Testa avaliação de interpolação com função de interpolação sem parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const interpolFunctions = {
      customize: () => { return 'xpto' }
    }
    const struct = {
      template: 'Teste {0}',
      args: [
        { function: 'customize' }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, interpolFunctions)
    expect(result).toEqual('Teste xpto')
  })

  test('Testa avaliação de interpolação com função geral sem parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customFunctions = { customize: () => { return 'xpto' } }
    const struct = {
      template: 'Teste {0}',
      args: [
        { function: 'customize' }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, wrapper.vm.customFunctions)
    expect(result).toEqual('Teste xpto')
  })

  test('Testa avaliação de interpolação com função de interpolação com parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const interpolFunctions = {
      customize: (a, b) => { return a.toString() + b.toString() }
    }
    const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste {0}',
      args: [
        {
          function: 'customize',
          fn_args: [
            { fixed: '1' },
            { named_prop: 'vl_indicador' }
          ]
        }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, interpolFunctions, base_object)
    expect(result).toEqual('Teste 1234')
  })

  test('Testa avaliação de interpolação com função geral com parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customFunctions = { customize: (a, b) => { return a.toString() + b.toString() } }
    const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste {0}',
      args: [
        {
          function: 'customize',
          fn_args: [
            { fixed: '1' },
            { named_prop: 'vl_indicador' }
          ]
        }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, wrapper.vm.customFunctions, base_object)
    expect(result).toEqual('Teste 1234')
  })

  test('Testa falha na passagem de named_prop sem envio de base_object', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customFunctions = { customize: (a, b) => { return (a ? a.toString() : a) + (b ? b.toString() : b) } }
    // const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste {0}',
      args: [
        {
          function: 'customize',
          fn_args: [
            { fixed: '1' },
            { named_prop: 'vl_indicador' }
          ]
        }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, wrapper.vm.customFunctions)
    expect(result).toEqual('Teste 1undefined')
  })

  test('Testa avaliação de interpolação com parâmetros diretos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste {0}: {1}',
      args: [
        { value: 1 },
        { named_prop: 'vl_indicador' }
      ]
    }

    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual('Teste 1: 234')
  })

  test('Testa avaliação de interpolação com parâmetros com link', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste link: {0}',
      args: [
        { link: 'teste.mpt.mp.br', text: 'test site' }
      ]
    }

    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual("Teste link: <a href='teste.mpt.mp.br'>test site</a>")
  })

  test('Testa avaliação de interpolação com valor default', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const base_object = { vl_indicador: '234' }
    const struct = {
      template: 'Teste {0}',
      args: [
        { named_prop: 'nu_competencia', default: 'Sem Registros' }
      ]
    }

    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual('Teste Sem Registros')
  })

  test('Testa avaliação de interpolação com valor formatado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const base_object = { vl_indicador: 0.234 }
    const struct = {
      template: 'Teste {0}',
      args: [
        { named_prop: 'vl_indicador', format: 'porcentagem', precision: 2, multiplier: 100 }
      ]
    }

    wrapper.vm.$textTransformService.context = wrapper.vm
    const result = wrapper.vm.$textTransformService.applyInterpol(struct, {}, null, base_object)
    expect(result).toEqual('Teste 23,40<span>%</span>')
  })

  test('Testa avaliação de interpolação com valor requerido não preenchido', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const base_object = { vl_indicador: 0.234 }
    const struct = {
      template: 'Teste {0}',
      args: [
        { named_prop: 'nu_competencia', required: true }
      ]
    }
    const cbInvalidate = () => { wrapper.vm.msg = 'requerido' }
    wrapper.vm.$textTransformService.applyInterpol(struct, {}, null, base_object, cbInvalidate)
    expect(wrapper.vm.msg).toEqual('requerido')
  })
})
