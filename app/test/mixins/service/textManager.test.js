import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import TextManager from '../../../mixins/service/textManager.js'
import NumberFormatter from '../../../mixins/service/numberFormatter.js'
import ViewConfReader from '../../../mixins/service/viewConfReader.js'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(TextManager)
Vue.use(NumberFormatter)
Vue.use(ViewConfReader)

// Tests
describe('TextManager', () => {
  test('Retorna vazio quando o template é nulo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let result = wrapper.vm.replaceArgs(null, null);
    expect(result).toEqual('');
  })

  test('Retorna string válida', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let result = wrapper.vm.replaceArgs(
      'Teste {0}: {1}',
      [1, "param"]
    );
    expect(result).toEqual('Teste 1: param');
  })

  test('Testa avaliação de interpolação sem estrutura de yaml informada', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let result = wrapper.vm.applyInterpol(null, {}, null);
    expect(result).toEqual("");
  })

  test('Testa avaliação de interpolação com texto fixo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let struct = { fixed: "Teste" };

    let result = wrapper.vm.applyInterpol(struct, {}, null);
    expect(result).toEqual("Teste");
  })

  test('Testa avaliação de interpolação com função de interpolação sem parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let interpolFunctions = {
      customize: () => { return 'xpto'}
    }
    let struct = {
      template: "Teste {0}",
      args: [
        { "function": "customize" }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, interpolFunctions);
    expect(result).toEqual("Teste xpto");
  })

  test('Testa avaliação de interpolação com função geral sem parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customize = () => { return 'xpto'};
    let struct = {
      template: "Teste {0}",
      args: [
        { "function": "customize" }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null);
    expect(result).toEqual("Teste xpto");
  })

  test('Testa avaliação de interpolação com função de interpolação com parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let interpolFunctions = {
      customize: (a, b) => { return a.toString() + b.toString(); }
    }
    let base_object = { vl_indicador: '234' }
    let struct = {
      template: "Teste {0}",
      args: [
        { "function": "customize",
          fn_args: [
            { fixed: "1" },
            { named_prop: "vl_indicador" }
          ]
        }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, interpolFunctions, base_object);
    expect(result).toEqual("Teste 1234");
  })

  test('Testa avaliação de interpolação com função geral com parâmetros', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customize = (a, b) => { return a.toString() + b.toString(); };
    let base_object = { vl_indicador: '234' };
    let struct = {
      template: "Teste {0}",
      args: [
        { "function": "customize",
          fn_args: [
            { fixed: "1" },
            { named_prop: "vl_indicador" }
          ]
        }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object);
    expect(result).toEqual("Teste 1234");
  })

  test('Testa falha na passagem de named_prop sem envio de base_object', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    wrapper.vm.customize = (a, b) => { return (a ? a.toString() : a) + (b ? b.toString() : b); };
    let base_object = { vl_indicador: '234' }
    let struct = {
      template: "Teste {0}",
      args: [
        { "function": "customize",
          fn_args: [
            { fixed: "1" },
            { named_prop: "vl_indicador" }
          ]
        }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null);
    expect(result).toEqual("Teste 1undefined");
  })

  test('Testa avaliação de interpolação com parâmetros diretos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let base_object = { vl_indicador: '234' };
    let struct = {
      template: "Teste {0}: {1}",
      args: [
        { value: 1 },
        { named_prop: "vl_indicador" }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object);
    expect(result).toEqual("Teste 1: 234");
  })

  test('Testa avaliação de interpolação com parâmetros com link', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let base_object = { vl_indicador: '234' };
    let struct = {
      template: "Teste link: {0}",
      args: [
        { link: "teste.mpt.mp.br", text: "test site" }
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object);
    expect(result).toEqual("Teste link: <a href='teste.mpt.mp.br'>test site</a>");
  })

  test('Testa avaliação de interpolação com valor default', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let base_object = { vl_indicador: '234' };
    let struct = {
      template: "Teste {0}",
      args: [
        { named_prop: "nu_competencia", default: "Sem Registros" },
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object);
    expect(result).toEqual("Teste Sem Registros");
  })

  test('Testa avaliação de interpolação com valor formatado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let base_object = { vl_indicador: .234 };
    let struct = {
      template: "Teste {0}",
      args: [
        { named_prop: "vl_indicador", format: "porcentagem", precision: 2, multiplier: 100 },
      ]
    };

    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object);
    expect(result).toEqual("Teste 23.40<span>%</span>");
  })

  test('Testa avaliação de interpolação com valor requerido não preenchido', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let base_object = { vl_indicador: .234 };
    let struct = {
      template: "Teste {0}",
      args: [
        { named_prop: "nu_competencia", required: true },
      ]
    };
    let cbInvalidate = () => { wrapper.vm.msg = 'requerido'; }
    let result = wrapper.vm.applyInterpol(struct, {}, null, base_object, cbInvalidate);
    expect(wrapper.vm.msg).toEqual("requerido");
  })
})