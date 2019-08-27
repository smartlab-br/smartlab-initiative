import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import AxiosCallSetup from '../../../mixins/service/axiosCallSetup.js'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(AxiosCallSetup)

// Tests
describe('AxiosCallSetup', () => {
  // test('Testa construção de url sem dados de ambiente ou do store', () => {
  //   const wrapper = mount(FLPOSobreLayout, { sync: false });
  //   wrapper.vm.$store = {
  //     state: {}
  //   };

  //   let result = wrapper.vm.getAxiosOptions('/hcalive');
  //   let expected = {
  //     method: "GET",
  //     "url": 'undefined/hcalive',
  //     headers: {"Content-Type": "application/json", "X-Gravitee-Api-Key": undefined}
  //   }
  //   expect(result).toEqual(expected);
  // })

  // test('Testa construção de url com dados do store', () => {
  //   const wrapper = mount(FLPOSobreLayout, { sync: false })
  //   wrapper.vm.$store = {
  //     state: { 
  //       DATAHUB_API_BASE_URL: 'http://test.mpt.mp.br',
  //       DATAHUB_API_KEY: '123456'
  //     }
  //   };
    
  //   let result = wrapper.vm.getAxiosOptions('/hcalive');
  //   let expected = {
  //     method: "GET",
  //     "url": 'http://test.mpt.mp.br/hcalive',
  //     headers: {"Content-Type": "application/json", "X-Gravitee-Api-Key": undefined}
  //   }
  //   expect(result).toEqual(expected);
  // })

  test('Testa construção de url com dados do ambiente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$store = {
      state: {}
    };
    process = {
      env: { 
        DATAHUB_API_BASE_URL: 'http://test.mpt.mp.br',
        DATAHUB_API_KEY: '123456'
      }
    };
    
    let result = wrapper.vm.getAxiosOptions('/hcalive');
    let expected = {
      method: "GET",
      "url": 'http://test.mpt.mp.br/hcalive',
      headers: {"Content-Type": "application/json", "X-Gravitee-Api-Key": undefined}
    }
    expect(result).toEqual(expected);
  })
})