import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import ViewConfReader from '../../../mixins/service/viewConfReader'
import NumberFormatter from '../../../mixins/service/numberFormatter'
import DatasetManager from '../../../mixins/service/datasetManager'
import IndicatorsModel from '../../../assets/model/singleton/indicatorsModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(ViewConfReader)
Vue.use(NumberFormatter)
Vue.use(DatasetManager)
Vue.prototype.$indicatorsModel = new IndicatorsModel();

// Tests
describe('ViewConfReader', () => {
  test('Verifica não preenchimento quando os dados de base não existirem', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.testContainer = 'untouched';

    let base_object_list = null;
    let rules = [
      { prop: "value", named_prop: 'vl_indicador', format: 'inteiro', default: "Sem Registros" },
      { prop: "description", fixed: "Habitantes (2010)" }
    ];
    
    wrapper.vm.autoFillLayout(base_object_list, rules);

    expect(wrapper.vm.testContainer).toEqual("untouched");
  })

  test('Verifica preenchimento de campos conforme rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.value = 'untouched';
    wrapper.vm.year = 'untouched';
    wrapper.vm.description = 'untouched';

    let base_object_list = [{ vl_indicador: 123.45 }];
    let rules = [
      { prop: "value", named_prop: 'vl_indicador', format: 'inteiro' },
      { prop: "year", named_prop: 'nu_competencia', default: "Sem Registros" },
      { prop: "description", fixed: "Habitantes" }
    ];
    
    wrapper.vm.autoFillLayout(base_object_list, rules);

    expect(wrapper.vm.value).toEqual("123");
    expect(wrapper.vm.year).toEqual("Sem Registros");
    expect(wrapper.vm.description).toEqual("Habitantes");
  })

  test('Verifica preenchimento de campos com funções do customFunctions dentro de rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.value = 'untouched';
    wrapper.vm.customFunctions = {
      customize: (a, b, c, d) => {return a + b + c + d; },
      fnNoArgs: () => { return '4'; },
      fnArgs: (a, b) => { return a.toString() + b.toString(); }
    };

    let base_object_list = [{ vl_indicador: 23 }];
    let rules = [
      { prop: "value",
        function: 'customize',
        fn_args: [
          { fixed: '1' },
          { named_prop: 'vl_indicador' },
          { function: 'fnNoArgs'},
          { function: 'fnArgs',
            fn_args: [
              { fixed: '5' },
              { fixed: '6' }
            ]
          }
        ]
      }
    ];
    
    wrapper.vm.autoFillLayout(base_object_list, rules);

    expect(wrapper.vm.value).toEqual("123456");
  })

  test('Verifica preenchimento de campos com funções do contexto dentro de rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.value = 'untouched';
    wrapper.vm.customize = (a, b, c, d) => { return a + b + c + d; };
    wrapper.vm.fnNoArgs = () => { return '4'; };
    wrapper.vm.fnArgs = (a, b) => { return a.toString() + b.toString(); };

    let base_object_list = [{ vl_indicador: 23 }];
    let rules = [
      { prop: "value",
        function: 'customize',
        fn_args: [
          { fixed: '1' },
          { named_prop: 'vl_indicador' },
          { function: 'fnNoArgs'},
          { function: 'fnArgs', 
            fn_args: [
              { fixed: '5' },
              { fixed: '6' }
            ]
          }
        ]
      }
    ];
    
    wrapper.vm.autoFillLayout(base_object_list, rules);

    expect(wrapper.vm.value).toEqual("123456");
  })

  test('Verifica preenchimento de campos de um innerProp conforme rules', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.inner = {
      value: 'untouched',
      year: "untouched",
      description: 'untouched'
    };

    let base_object_list = [{ vl_indicador: 123.45 }];
    let rules = [
      { prop: "value", named_prop: 'vl_indicador', format: 'inteiro' },
      { prop: "year", named_prop: 'nu_competencia', default: "Sem Registros" },
      { prop: "description", fixed: "Habitantes" }
    ];
        
    wrapper.vm.autoFillLayout(base_object_list, rules, null, { innerProp: 'inner' });

    expect(wrapper.vm.inner.value).toEqual("123");
    expect(wrapper.vm.inner.year).toEqual("Sem Registros");
    expect(wrapper.vm.inner.description).toEqual("Habitantes");
  })

  test('Verifica ordenação de dataset', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });

    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    let result = wrapper.vm.reformDataset(ds, { order_field: 'nu_competencia' }, {});

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 },
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 }
    ]);
  })

  test('Verifica aplicação de formatters', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });

    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    let options = {
      formatters: [
        { id: 'vl_indicador', format: 'inteiro' }
      ]
    }
    let result = wrapper.vm.reformDataset(ds, options, {});

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, fmt_vl_indicador: '123' }, 
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, fmt_vl_indicador: '679' }
    ]);
  })

  test('Verifica aplicação de calcs', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });

    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    let options = {
      calcs: [
        { id: 'custom', function: 'cstmMultiply', format: 'inteiro',
          fn_args: [
            { fixed: 2 },
            { named_prop: 'vl_indicador'}
          ]
        }
      ]
    }
    
    let result = wrapper.vm.reformDataset(ds, options, { cstmMultiply: (d, a, b) => { return a * b; } });

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, calc_custom: '247' }, 
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, calc_custom: '1,358' }
    ]);
  })

  test('Verifica aplicação de calcs com funções de contexto', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    wrapper.vm.cstmMultiply = (d, a, b) => { return a * b; };
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    let options = {
      calcs: [
        { id: 'custom', function: 'cstmMultiply', format: 'real',
          fn_args: [
            { fixed: 2 },
            { named_prop: 'vl_indicador'}
          ]
        }
      ]
    }
    
    let result = wrapper.vm.reformDataset(ds, options, null);

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, calc_custom: '246.9' }, 
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, calc_custom: '1,357.8' }
    ]);
  })

  test('Verifica aplicação de melt', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, rank_br: 1 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, rank_br: 987 }
    ]
    let options = {
      melt: {
        value_field: 'valor',
        layer_fields: ['vl_indicador', 'rank_br'],
        layer_field: 'subindicador',
        label_fields: ['valor', 'ranking'],
        label_field: 'label'
      }
    }
    
    let result = wrapper.vm.reformDataset(ds, options, null);

    expect(result).toEqual([
      { "cd_indicador": "1", "label": "valor",
        "nu_competencia": 2099, "rank_br": 1,
        "subindicador": "vl_indicador", "valor": 123.45,
        "vl_indicador": 123.45 },
      { "cd_indicador": "1", "label": "ranking", 
        "nu_competencia": 2099, "rank_br": 1,
        "subindicador": "rank_br", "valor": 1, "vl_indicador": 123.45 },
      { "cd_indicador": "1", "label": "valor", "nu_competencia": 2047,
        "rank_br": 987, "subindicador": "vl_indicador", "valor": 678.9,
        "vl_indicador": 678.9 },
      { "cd_indicador": "1", "label": "ranking", "nu_competencia": 2047,
        "rank_br": 987, "subindicador": "rank_br", "valor": 987,
        "vl_indicador": 678.9 }
    ]);
  })
})
