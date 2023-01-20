import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import { NumberTransformService } from '~/plugins/service/singleton/numberTransformService'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.prototype.$numberTransformService = new NumberTransformService()

// Tests
describe('NumberFormatter', () => {
  test('Formata um inteiro corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.34', 'inteiro', 0, null);
    expect(result).toEqual('12');
  })

  test('Formata um inteiro a partir de um float com aproximação para cima', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.89', 'inteiro');
    expect(result).toEqual('13');
  })

  test('Formata um real corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.34', 'real');
    expect(result).toEqual('12,3');
  })

  test('Formata um real com precisão definida corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.345678', 'real', 3);
    expect(result).toEqual('12,346');
  })

  test('Formata um percentual corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.34', 'porcentagem');
    expect(result).toEqual('12,3<span>%</span>');
  })

  test('Formata um percentual com precisão definida corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12.345678', 'porcentagem', 3);
    expect(result).toEqual('12,346<span>%</span>');
  })

  test('Formata um percentual com multiplicador corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('0.1234', 'porcentagem', null, 100);
    expect(result).toEqual('12,3<span>%</span>');
  })

  test('Formata um percentual com multiplicador e precisão definidos corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('0.12345678', 'porcentagem', 3, 100);
    expect(result).toEqual('12,346<span>%</span>');
  })

  test('Formata um monetário corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345.678', 'monetario');
    expect(result).toEqual('<span>R$</span>12.345,7');
  })

  test('Formata um monetário com precisão definida corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345.678', 'monetario', 2);
    expect(result).toEqual('<span>R$</span>12.345,68');
  })

  test('Formatação padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345.678');
    expect(result).toEqual('12.345,7');
  })

  test('Texto padrão quando valor é nule deve ser apenas "-"', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber(null);
    expect(result).toEqual('-');
  })

  test('Formata um número com collapse (mil)', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345.678', 'real', 2, 1, true);
    expect(result).toEqual('12,3<span>mil</span>');
  })

  test('Formata um número com collapse (milhão)', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345678.901', 'real', 2, 1, true);
    expect(result).toEqual('12,3<span>mi</span>');
  })

  test('Formata um número com collapse (bilhão)', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345678901.234', 'real', 2, 1, true);
    expect(result).toEqual('12,3<span>bi</span>');
  })

  test('Formata um número com collapse (trilhão)', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$numberTransformService.formatNumber('12345678901234.567', 'real', 2, 1, true);
    expect(result).toEqual('12,3<span>tri</span>');
  })
})