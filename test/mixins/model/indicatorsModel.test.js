import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

import { IndicatorsModel } from '~/plugins/model/singleton/indicatorsModel'
import { NumberTransformService } from '~/plugins/service/singleton/numberTransformService'
import { ObjectTransformService } from '~/plugins/service/singleton/objectTransformService'
// import { ViewConfReader } from '~/plugins/mixins/service/viewConfReader.js'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

Vue.use(Vuetify)

require('../../setup.js')

// Sets the mixin in the Vue instance
Vue.prototype.$numberTransformService = new NumberTransformService()
Vue.prototype.$objectTransformService = new ObjectTransformService()
// Vue.use(ViewConfReader)
Vue.prototype.$indicatorsModel = new IndicatorsModel()

// Tests
describe('IndicatorsModel', () => {
  test('Retorna vazio quando nenhuma estrutura é passada para pegar um atributo de um indicador', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(null, {}, {})
    expect(result).toEqual(null)
  })

  test('Retorna vazio quando nenhum indicador é passado para pegar um atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance({}, {}, null)
    expect(result).toEqual(null)
  })

  test('Retorna o valor padrão de um atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance({ default: 'default' }, {}, null)
    expect(result).toEqual('default')
  })

  test('Verifica correta obtenção de atributo nomeado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const indicador = { vl_indicador: 123.45 }
    const structure = { named_prop: 'vl_indicador' }
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(structure, {}, indicador)
    expect(result).toEqual(123.45)
  })

  test('Verifica correta aplicação de função na obtenção de atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const customFunctions = { customize: (a, b) => { return a * b } }
    const indicador = { vl_indicador: 123.45 }
    const structure = {
      function: 'customize',
      fn_args: [
        { fixed: 2 },
        { named_prop: 'vl_indicador' }
      ]
    }
    wrapper.vm.$indicatorsModel.context = wrapper.vm
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(structure, customFunctions, indicador)
    expect(result).toEqual(246.9)
  })

  test('Formata adequadamente um atributo de um indicador', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    const indicador = { vl_indicador: 123.45 }
    const structure = { named_prop: 'vl_indicador', format: 'inteiro' }
    wrapper.vm.$indicatorsModel.context = wrapper.vm
    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(structure, {}, indicador)
    expect(result).toEqual('123')
  })

  test('Invalida e substitui por default um atributo requerido de um indicador, quando não encontrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const cbInvalid = jest.fn()
    const structure = { default: 'default', required: true }

    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(structure, {}, null, cbInvalid)
    expect(result).toEqual('default')
    expect(cbInvalid).toHaveBeenCalled()
  })

  test('Invalida e retorna Sem Registros um atributo requerido de um indicador, quando não encontrado e na ausência de valor default', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const cbInvalid = jest.fn()
    const structure = { required: true }

    const result = wrapper.vm.$indicatorsModel.getAttributeFromIndicatorInstance(structure, {}, null, cbInvalid)
    expect(result).toEqual('Sem Registros')
    expect(cbInvalid).toHaveBeenCalled()
  })

  test('Combina indicadores de acordo com a estrutura', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const funcs = {
      incr: (a, b, c) => { return b / a * c }
    }
    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]
    const structure = [
      {
        id: 'cmb',
        desc: 'combined',
        year: 2099,
        function: 'incr',
        fn_args: [
          { id: '1', year: 2099 },
          { id: '1', year: 2047 },
          { fixed: 100 }
        ]
      }
    ]

    const result = wrapper.vm.$indicatorsModel.combineIndicators(ds, structure, funcs)
    expect(result).toEqual([
      {
        cd_indicador: 'cmb',
        ds_indicador: 'combined',
        nu_competencia: 2099,
        vl_indicador: 55.55555555555556,
        ds_agreg_primaria: undefined,
        ds_agreg_secundaria: undefined,
        ds_indicador_radical: 'combined'
      }
    ])
  })

  test('Confirma que um determinado indicador é o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = wrapper.vm.$indicatorsModel.isMaxOnSlice(null, ds, ds[0], 'nu_competencia')
    expect(result).toEqual(true)
  })

  test('Confirma que um determinado indicador é o mínimo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '1', nu_competencia: 2136, vl_indicador: 2.7 }
    ]

    const result = wrapper.vm.$indicatorsModel.isMinOnSlice(null, ds, ds[1], 'nu_competencia')
    expect(result).toEqual(true)
  })

  test('Rejeita determinado indicador como o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = wrapper.vm.$indicatorsModel.isMaxOnSlice(null, ds, ds[1], 'nu_competencia')
    expect(result).toEqual(false)
  })

  test('Fatia corretamente o dataset, por ano determinado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const structure = { year: 2047 }
    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = wrapper.vm.$indicatorsModel.slice(structure, ds)
    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ])
  })

  test('Fatia corretamente o dataset pelo max', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const structure = { year: 'max' }
    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]

    const result = wrapper.vm.$indicatorsModel.slice(structure, ds)
    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 }
    ])
  })

  test('Transforma corretamente um dataset em um array de valores', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const args = [
      { id: '1', year: 2099, named_prop: 'vl_indicador' },
      { named_prop: 'vl_indicador' },
      { link: 'test.mpt.mp.br', text: 'teste' }
    ]
    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]
    const invalidate = jest.fn()

    const result = wrapper.vm.$indicatorsModel.indicatorsToValueArray(args, {}, ds, invalidate)
    expect(result).toEqual([
      1.8,
      1.8,
      "<a href='test.mpt.mp.br'>teste</a>"
    ])
  })

  test('Verifica ordenação de dataset', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const result = wrapper.vm.$indicatorsModel.sortObject(ds, 'nu_competencia')

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 },
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 }
    ])
  })

  test('Verifica aplicação de melt', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, rank_br: 1 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, rank_br: 987 }
    ]
    const value_field = 'valor'
    const layer_fields = ['vl_indicador', 'rank_br']
    const layer_field = 'subindicador'
    const label_fields = ['valor', 'ranking']
    const label_field = 'label'

    const result = wrapper.vm.$indicatorsModel.melt(
      ds, value_field, layer_fields, layer_field,
      label_fields, label_field, null
    )

    expect(result).toEqual([
      {
        cd_indicador: '1',
        label: 'valor',
        nu_competencia: 2099,
        rank_br: 1,
        subindicador: 'vl_indicador',
        valor: 123.45,
        vl_indicador: 123.45
      },
      {
        cd_indicador: '1',
        label: 'ranking',
        nu_competencia: 2099,
        rank_br: 1,
        subindicador: 'rank_br',
        valor: 1,
        vl_indicador: 123.45
      },
      {
        cd_indicador: '1',
        label: 'valor',
        nu_competencia: 2047,
        rank_br: 987,
        subindicador: 'vl_indicador',
        valor: 678.9,
        vl_indicador: 678.9
      },
      {
        cd_indicador: '1',
        label: 'ranking',
        nu_competencia: 2047,
        rank_br: 987,
        subindicador: 'rank_br',
        valor: 987,
        vl_indicador: 678.9
      }
    ])
  })
})
