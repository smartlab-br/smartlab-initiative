import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import ObservatoriesModel from '../../../mixins/model/observatoriesModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(ObservatoriesModel)

// Tests
describe('ObservatoriesModel', () => {
  test('Pega corretamente os dados gerais dos observatórios', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.observatories = [1, 2];
    let result = wrapper.vm.getObservatories();
    expect(result).toEqual([1, 2]);
  })
})