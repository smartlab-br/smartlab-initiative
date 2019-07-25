import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import DimensionsModel from '../../../mixins/model/dimensionsModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(DimensionsModel)

// Tests
describe('DimensionsModel', () => {
  test('Pega corretamente as dimensões globais', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.globalDimensions = [1, 2];
    let result = wrapper.vm.getDimensions();
    expect(result).toEqual([1, 2]);
  })

  test('Não retorna as dimensões locais quando passado um id de observatório', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.globalDimensions = [1, 2];
    let result = wrapper.vm.getDimensions('xpto');
    expect(result).toEqual(undefined);
  })

  test('Pega corretamente uma dimensão pelo ID', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.globalDimensions = [
      { id: 'td', name: 'trabalho decente' },
      { id: 'ti', name: 'trabalho infantil' },
    ];
    let result = wrapper.vm.findDimensionById('ti');
    expect(result).toEqual({ id: 'ti', name: 'trabalho infantil' });
  })

  test('Pega a primeira dimensão quando não encontra pelo ID', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.globalDimensions = [
      { id: 'td', name: 'trabalho decente' },
      { id: 'ti', name: 'trabalho infantil' },
    ];
    let result = wrapper.vm.findDimensionById('xpto');
    expect(result).toEqual({ id: 'td', name: 'trabalho decente' });
  })
})