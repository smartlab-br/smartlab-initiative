import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import IndicatorsModel from '../../../mixins/model/indicatorsModel'
import NumberFormatter from '../../../mixins/service/numberFormatter'
import ViewConfReader from '../../../mixins/service/viewConfReader.js'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(IndicatorsModel)
Vue.use(NumberFormatter)
Vue.use(ViewConfReader)

// Tests
describe('IndicatorsModel', () => {
  test('Retorna vazio quando nenhuma estrutura é passada para pegar um atributo de um indicador', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getAttributeFromIndicatorInstance(null, {}, {});
    expect(result).toEqual(null);
  })

  test('Retorna vazio quando nenhum indicador é passado para pegar um atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getAttributeFromIndicatorInstance({}, {}, null);
    expect(result).toEqual(null);
  })

  test('Retorna o valor padrão de um atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getAttributeFromIndicatorInstance({ default: 'default' }, {}, null);
    expect(result).toEqual('default');
  })

  test('Verifica correta obtenção de atributo nomeado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let indicador = { vl_indicador: 123.45 };
    let structure = { named_prop: 'vl_indicador'};
    let result = wrapper.vm.getAttributeFromIndicatorInstance(structure, {}, indicador);
    expect(result).toEqual(123.45);
  })

  test('Verifica correta aplicação de função na obtenção de atributo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    let customFunctions = { customize: (a, b) => { return a * b; } };
    let indicador = { vl_indicador: 123.45 };
    let structure = {
      function: 'customize',
      fn_args: [
        { fixed: 2 },
        { named_prop: 'vl_indicador' }
      ]
    };
    let result = wrapper.vm.getAttributeFromIndicatorInstance(structure, customFunctions, indicador);
    expect(result).toEqual(246.9);
  })

  test('Formata adequadamente um atributo de um indicador', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let indicador = { vl_indicador: 123.45 };
    let structure = { named_prop: 'vl_indicador', format: 'inteiro'};
    let result = wrapper.vm.getAttributeFromIndicatorInstance(structure, {}, indicador);
    expect(result).toEqual('123');
  })

  test('Invalida e substitui por default um atributo requerido de um indicador, quando não encontrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let cbInvalid = jest.fn();
    let structure = { default: 'default', required: true };

    let result = wrapper.vm.getAttributeFromIndicatorInstance(structure, {}, null, cbInvalid);
    expect(result).toEqual('default');
    expect(cbInvalid).toHaveBeenCalled();
  })

  test('Invalida e retorna Sem Registros um atributo requerido de um indicador, quando não encontrado e na ausência de valor default', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let cbInvalid = jest.fn();
    let structure = { required: true };

    let result = wrapper.vm.getAttributeFromIndicatorInstance(structure, {}, null, cbInvalid);
    expect(result).toEqual('Sem Registros');
    expect(cbInvalid).toHaveBeenCalled();
  })

  test('Combina indicadores de acordo com a estrutura', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let funcs = {
      incr: (a, b, c) => { return b / a * c; }
    }
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]
    let structure = [
      { id: 'cmb', desc: 'combined', year: 2099,
        function: 'incr',
        fn_args: [
          { id: '1', year: 2099 },
          { id: '1', year: 2047 },
          { fixed: 100 }
        ]
      }
    ];

    let result = wrapper.vm.combineIndicators(ds, structure, funcs);
    expect(result).toEqual([
      { "cd_indicador": 'cmb', "ds_indicador": 'combined', 
        "nu_competencia": 2099, "vl_indicador": 55.55555555555556,
        "ds_agreg_primaria": undefined, "ds_agreg_secundaria": undefined,
        "ds_indicador_radical": "combined"
      }
    ]);
  })

  test('Confirma que um determinado indicador é o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]
    
    let result = wrapper.vm.isMaxOnSlice(null, ds, ds[0], 'nu_competencia');
    expect(result).toEqual(true);
  })

  test('Confirma que um determinado indicador é o mínimo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '1', nu_competencia: 2136, vl_indicador: 2.7 }
    ]
    
    let result = wrapper.vm.isMinOnSlice(null, ds, ds[1], 'nu_competencia');
    expect(result).toEqual(true);
  })

  test('Rejeita determinado indicador como o máximo do dataset de acordo com um campo, dentre os que tem o mesmo id', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 }
    ]
    
    let result = wrapper.vm.isMaxOnSlice(null, ds, ds[1], 'nu_competencia');
    expect(result).toEqual(false);
  })

  test('Fatia corretamente o dataset, por ano determinado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let structure = { year: 2047 };
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]
    
    let result = wrapper.vm.slice(structure, ds);
    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]);
  })

  test('Fatia corretamente o dataset pelo max', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let structure = { year: 'max' };
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]
    
    let result = wrapper.vm.slice(structure, ds);
    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 }
    ]);
  })
  
  test('Transforma corretamente um dataset em um array de valores', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let args = [
      { id: '1', year: 2099, named_prop: 'vl_indicador' },
      { named_prop: 'vl_indicador' },
      { link: 'test.mpt.mp.br', text: 'teste' }
    ];
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 1 },
      { cd_indicador: '2', nu_competencia: 2099, vl_indicador: 1.8 },
      { cd_indicador: '2', nu_competencia: 2047, vl_indicador: 1 }
    ]
    let invalidate = jest.fn();
    
    let result = wrapper.vm.indicatorsToValueArray(args, {}, ds, invalidate);
    expect(result).toEqual([
      1.8,
      1.8,
      "<a href='test.mpt.mp.br'>teste</a>"
    ]);
  })
})
