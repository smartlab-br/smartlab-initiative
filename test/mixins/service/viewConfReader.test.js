import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

// eslint-disable-next-line no-unused-vars
import { ViewConfReader } from '~/plugins/mixins/service/viewConfReader'
import { NumberTransformService } from '~/plugins/service/singleton/numberTransformService'
import { IndicatorsModel } from '~/plugins/model/singleton/indicatorsModel'
import { ObjectTransformService } from '~/plugins/service/singleton/objectTransformService'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

Vue.use(Vuetify)

require('../../setup.js')

// Sets the mixin in the Vue instance
// Vue.use(ViewConfReader)
Vue.prototype.$numberTransformService = new NumberTransformService()
Vue.prototype.$indicatorsModel = new IndicatorsModel()
Vue.prototype.$objectTransformService = new ObjectTransformService()

// Tests
describe('ViewConfReader', () => {
  test('Verifica não preenchimento quando os dados de base não existirem', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.testContainer = 'untouched'

    const base_object_list = null
    const rules = [
      { prop: 'value', named_prop: 'vl_indicador', format: 'inteiro', default: 'Sem Registros' },
      { prop: 'description', fixed: 'Habitantes (2010)' }
    ]

    wrapper.vm.autoFillLayout(base_object_list, rules)

    expect(wrapper.vm.testContainer).toEqual('untouched')
  })

  test('Verifica preenchimento de campos conforme rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.value = 'untouched'
    wrapper.vm.year = 'untouched'
    wrapper.vm.description = 'untouched'

    const base_object_list = [{ vl_indicador: 123.45 }]
    const rules = [
      { prop: 'value', named_prop: 'vl_indicador', format: 'inteiro' },
      { prop: 'year', named_prop: 'nu_competencia', default: 'Sem Registros' },
      { prop: 'description', fixed: 'Habitantes' }
    ]

    wrapper.vm.autoFillLayout(base_object_list, rules)

    expect(wrapper.vm.value).toEqual('123')
    expect(wrapper.vm.year).toEqual('Sem Registros')
    expect(wrapper.vm.description).toEqual('Habitantes')
  })

  test('Verifica preenchimento de campos com funções do customFunctions dentro de rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.value = 'untouched'
    wrapper.vm.customFunctions = {
      customize: (a, b, c, d) => { return a + b + c + d },
      fnNoArgs: () => { return '4' },
      fnArgs: (a, b) => { return a.toString() + b.toString() }
    }

    const base_object_list = [{ vl_indicador: 23 }]
    const rules = [
      {
        prop: 'value',
        function: 'customize',
        fn_args: [
          { fixed: '1' },
          { named_prop: 'vl_indicador' },
          { function: 'fnNoArgs' },
          {
            function: 'fnArgs',
            fn_args: [
              { fixed: '5' },
              { fixed: '6' }
            ]
          }
        ]
      }
    ]

    wrapper.vm.autoFillLayout(base_object_list, rules)

    expect(wrapper.vm.value).toEqual('123456')
  })

  test('Verifica preenchimento de campos com funções do contexto dentro de rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.value = 'untouched'
    wrapper.vm.customFunctions = {
      customize: (a, b, c, d) => { return a + b + c + d },
      fnNoArgs: () => { return '4' },
      fnArgs: (a, b) => { return a.toString() + b.toString() }
    }

    const base_object_list = [{ vl_indicador: 23 }]
    const rules = [
      {
        prop: 'value',
        function: 'customize',
        fn_args: [
          { fixed: '1' },
          { named_prop: 'vl_indicador' },
          { function: 'fnNoArgs' },
          {
            function: 'fnArgs',
            fn_args: [
              { fixed: '5' },
              { fixed: '6' }
            ]
          }
        ]
      }
    ]

    wrapper.vm.autoFillLayout(base_object_list, rules)

    expect(wrapper.vm.value).toEqual('123456')
  })

  test('Verifica preenchimento de campos de um innerProp conforme rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.inner = {
      value: 'untouched',
      year: 'untouched',
      description: 'untouched'
    }

    const base_object_list = [{ vl_indicador: 123.45 }]
    const rules = [
      { prop: 'value', named_prop: 'vl_indicador', format: 'inteiro' },
      { prop: 'year', named_prop: 'nu_competencia', default: 'Sem Registros' },
      { prop: 'description', fixed: 'Habitantes' }
    ]

    wrapper.vm.autoFillLayout(base_object_list, rules, null, { innerProp: 'inner' })

    expect(wrapper.vm.inner.value).toEqual('123')
    expect(wrapper.vm.inner.year).toEqual('Sem Registros')
    expect(wrapper.vm.inner.description).toEqual('Habitantes')
  })

  test('Verifica ordenação de dataset', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const result = wrapper.vm.reformDataset(ds, { order_field: 'nu_competencia' }, {})

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 },
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 }
    ])
  })

  test('Verifica aplicação de formatters', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const options = {
      formatters: [
        { id: 'vl_indicador', format: 'inteiro' }
      ]
    }
    const result = wrapper.vm.reformDataset(ds, options, {})

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, fmt_vl_indicador: '123' },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, fmt_vl_indicador: '679' }
    ])
  })

  test('Verifica aplicação de calcs', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const options = {
      calcs: [
        {
          id: 'custom',
          function: 'cstmMultiply',
          format: 'inteiro',
          fn_args: [
            { fixed: 2 },
            { named_prop: 'vl_indicador' }
          ]
        }
      ]
    }

    const result = wrapper.vm.reformDataset(ds, options, { cstmMultiply: (d, a, b) => { return a * b } })

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, calc_custom: '247' },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, calc_custom: '1.358' }
    ])
  })

  test('Verifica aplicação de calcs com funções de contexto', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customFunctions = { cstmMultiply: (d, a, b) => { return a * b } }
    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    const options = {
      calcs: [
        {
          id: 'custom',
          function: 'cstmMultiply',
          format: 'real',
          fn_args: [
            { fixed: 2 },
            { named_prop: 'vl_indicador' }
          ]
        }
      ]
    }

    const result = wrapper.vm.reformDataset(ds, options, wrapper.vm.customFunctions)

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, calc_custom: '246,9' },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, calc_custom: '1.357,8' }
    ])
  })

  test('Verifica aplicação de melt', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    const ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, rank_br: 1 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, rank_br: 987 }
    ]
    const options = {
      melt: {
        value_field: 'valor',
        layer_fields: ['vl_indicador', 'rank_br'],
        layer_field: 'subindicador',
        label_fields: ['valor', 'ranking'],
        label_field: 'label'
      }
    }

    const result = wrapper.vm.reformDataset(ds, options, null)

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
