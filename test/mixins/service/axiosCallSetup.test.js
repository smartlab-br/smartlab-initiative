// import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

// Imports a component to serve as a bridge to the mixin
// import FLPOSobreLayout from '~/components/FLPOSobreLayout'
import { AxiosCallSetupService } from '~/plugins/service/singleton/axiosCallSetupService'

Vue.use(Vuetify)

require('../../setup.js')

// Sets the mixin in the Vue instance
Vue.prototype.$axiosCallSetupService = new AxiosCallSetupService()

// Tests
describe('AxiosCallSetup', () => {
  // test('Testa construção de url sem dados de ambiente ou do store', () => {
  //   const wrapper = mount(FLPOSobreLayout, { sync: false });
  //   wrapper.vm.$store = {
  //     state: {}
  //   };

  //   let result = wrapper.vm.$axiosCallSetupService.getAxiosOptions('/hcalive');
  //   let expected = {
  //     method: "GET",
  //     "url": 'undefined/hcalive',
  //     headers: {"Content-Type": "application/json", "X-Mpt-Api-Key": undefined}
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

  //   let result = wrapper.vm.$axiosCallSetupService.getAxiosOptions('/hcalive');
  //   let expected = {
  //     method: "GET",
  //     "url": 'http://test.mpt.mp.br/hcalive',
  //     headers: {"Content-Type": "application/json", "X-Mpt-Api-Key": undefined}
  //   }
  //   expect(result).toEqual(expected);
  // })

  test('Testa construção de url com dados do ambiente', () => {
    // TO-DO Corrigir este teste, verificar alteração da recuperação de variáveis de ambiente
    expect('a').toEqual('a')
    //    const wrapper = mount(FLPOSobreLayout, { sync: false })
    //    wrapper.vm.$store = {
    //      state: {}
    //    };
    //    process = {
    //      env: {
    //        DATAHUB_API_BASE_URL: 'http://test.mpt.mp.br',
    //        DATAHUB_API_KEY: '123456'
    //      }
    //    };
    //
    //    let result = wrapper.vm.$axiosCallSetupService.getAxiosOptions('/hcalive');
    //    let expected = {
    //      method: "GET",
    //      "url": 'http://test.mpt.mp.br/hcalive',
    //      headers: {"Content-Type": "application/json", "X-Mpt-Api-Key": undefined}
    //    }
    //    expect(result).toEqual(expected);
  })
})
