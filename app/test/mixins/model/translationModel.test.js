import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import TranslationModel from '../../../mixins/model/translationModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(TranslationModel)

// Tests
describe('TranslationModel', () => {
  const locales = [
    { lbl: 'Português', value: 'pt', flag: '/static/flags/br.svg',
      browser_langs: ['pt', 'pt-br', 'pt-BR'] },
    { lbl: 'English', value: 'en', flag: '/static/flags/us.svg',
      browser_langs: ['en', 'en-gb', 'en-GB'] },
    { lbl: 'Italiano', value: 'it', flag: '/static/flags/it.svg',
      browser_langs: ['it'] }, 
  ];

  test('Pega corretamente os idiomas', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.locales = locales;
    let result = wrapper.vm.findAllLocales();
    expect(result).toEqual(locales);
  })

  test('Grava corretamente um idioma inicial no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$store = {
      state: {}
    };
    wrapper.vm.setLocale(locales[0]);
    let result = wrapper.vm.$store.state.LOCALE;
    expect(result).toEqual('pt');
  })

  test('Troca corretamente um idioma no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$store = {
      state: {}
    };
    wrapper.vm.setLocale(locales[0]);
    let result = wrapper.vm.$store.state.LOCALE;
    expect(result).toEqual('pt');
    wrapper.vm.setLocale(locales[1]);
    result = wrapper.vm.$store.state.LOCALE;
    expect(result).toEqual('en');
  })

  test('Mantém corretamente um idioma no store, se passado nulo', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$store = {
      state: {}
    };
    wrapper.vm.setLocale(locales[0]);
    let result = wrapper.vm.$store.state.LOCALE;
    expect(result).toEqual('pt');
    wrapper.vm.setLocale(null);
    result = wrapper.vm.$store.state.LOCALE;
    expect(result).toEqual('pt');
  })

  test('Verifica se retorna o locale definido anteriormente no store', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$store = {
      state: {}
    };
    wrapper.vm.setLocale(locales[2]);
    let result = wrapper.vm.findBrowserLocale();
    expect(result).toEqual('it');
  })

  // TODO Como fazer mock de config de browser?
  // test('Verifica se retorna o locale do browser corretamente', () => {
  //   const wrapper = mount(FLPOSobreLayout, { })
  //   wrapper.vm.$store = {
  //     state: {}
  //   };
  //   let result = wrapper.vm.findBrowserLocale();
  //   console.log(wrapper);
  //   expect(result).toEqual('it');
  // })
})