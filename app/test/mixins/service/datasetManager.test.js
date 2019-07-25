import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import DatasetManager from '../../../mixins/service/datasetManager'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(DatasetManager)

// Tests
describe('DatasetManager', () => {
  test('Verifica ordenação de dataset', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });

    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 }
    ]
    let result = wrapper.vm.sortObject(ds, 'nu_competencia');

    expect(result).toEqual([
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9 },
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45 }
    ]);
  })

  test('Verifica aplicação de melt', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false });
    
    let ds = [
      { cd_indicador: '1', nu_competencia: 2099, vl_indicador: 123.45, rank_br: 1 },
      { cd_indicador: '1', nu_competencia: 2047, vl_indicador: 678.9, rank_br: 987 }
    ]
    let value_field = 'valor';
    let layer_fields = ['vl_indicador', 'rank_br'];
    let layer_field = 'subindicador';
    let label_fields = ['valor', 'ranking'];
    let label_field = 'label';
      
    let result = wrapper.vm.melt(
      ds, value_field, layer_fields, layer_field, 
      label_fields, label_field, null
    );

    expect(result).toEqual([
      { "cd_indicador": "1", "label": "valor", "nu_competencia": 2099,
        "rank_br": 1, "subindicador": "vl_indicador", "valor": 123.45,
        "vl_indicador": 123.45 },
      { "cd_indicador": "1", "label": "ranking", "nu_competencia": 2099,
        "rank_br": 1, "subindicador": "rank_br", "valor": 1,
        "vl_indicador": 123.45 },
      { "cd_indicador": "1", "label": "valor", "nu_competencia": 2047,
        "rank_br": 987, "subindicador": "vl_indicador", "valor": 678.9,
        "vl_indicador": 678.9 },
      { "cd_indicador": "1", "label": "ranking", "nu_competencia": 2047,
        "rank_br": 987, "subindicador": "rank_br", "valor": 987,
        "vl_indicador": 678.9 }
    ]);
  })
})
