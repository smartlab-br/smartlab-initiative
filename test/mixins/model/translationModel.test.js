import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import { TranslationModel } from '~/plugins/model/singleton/translationModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.prototype.$translationModel = new TranslationModel();

// Tests
describe('TranslationModel', () => {
  const locales = [
    { lbl: 'Português', value: 'pt', flag: '/flags/br.svg',
      browser_langs: ['pt', 'pt-br', 'pt-BR'] },
    { lbl: 'English', value: 'en', flag: '/flags/us.svg',
      browser_langs: ['en', 'en-gb', 'en-GB'] } 
  ];

  test('Pega corretamente os idiomas', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$translationModel.findAllLocales();
    expect(result).toEqual(locales);
  })

  test('Grava corretamente um idioma inicial no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$translationModel.setLocale(locales[0]);
    let result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('pt');
  })

  test('Troca corretamente um idioma no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$translationModel.setLocale(locales[0]);
    let result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('pt');
    wrapper.vm.$translationModel.setLocale(locales[1]);
    result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('en');
  })

  test('Mantém corretamente um idioma no store, se passado nulo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$translationModel.setLocale(locales[0]);
    let result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('pt');
    wrapper.vm.$translationModel.setLocale(null);
    result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('pt');
  })

  test('Verifica se retorna o locale definido anteriormente no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$translationModel.setLocale(locales[1]);
    let result = wrapper.vm.$translationModel.getLocale().value;
    expect(result).toEqual('en');
  })
})