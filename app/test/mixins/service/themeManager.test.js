import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import colors from 'vuetify/es5/util/colors'
import ThemeManager from '../../../mixins/service/themeManager'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(ThemeManager)

// Tests
describe('ThemeManager', () => {

  

  // Testes que mexem com o tema - toda mudança de tema afeta a instância inteira.
  test('Verifica se a mudança para um tema válido funciona corretamente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.changeTheme('te');

    expect(wrapper.vm.$vuetify.theme.primary).toEqual(colors.brown.darken4);
    expect(wrapper.vm.$vuetify.theme.secondary).toEqual(colors.brown.lighten4);
    expect(wrapper.vm.$vuetify.theme.accent).toEqual(colors.cyan.accent4);
    expect(wrapper.vm.$vuetify.theme.error).toEqual(colors.red.base);
    expect(wrapper.vm.$vuetify.theme.warning).toEqual(colors.amber.base);
    expect(wrapper.vm.$vuetify.theme.info).toEqual(colors.blue.base);
    expect(wrapper.vm.$vuetify.theme.success).toEqual(colors.green.base);
    expect(wrapper.vm.$vuetify.theme.toolbar).toEqual(colors.brown.darken4);
    expect(wrapper.vm.$vuetify.theme.background).toEqual('#EFEFEF');
    expect(wrapper.vm.$vuetify.theme.background2).toEqual(colors.grey.lighten2);
  })

  test('Verifica se o tema permanece o mesmo se o observatório não existir na coleção de temas', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.changeTheme('xpto');

    expect(wrapper.vm.$vuetify.theme.primary).toEqual(colors.grey.darken4);
    expect(wrapper.vm.$vuetify.theme.secondary).toEqual(colors.grey.darken3);
    expect(wrapper.vm.$vuetify.theme.accent).toEqual(colors.cyan.accent1);
    expect(wrapper.vm.$vuetify.theme.error).toEqual(colors.red.base);
    expect(wrapper.vm.$vuetify.theme.warning).toEqual(colors.amber.base);
    expect(wrapper.vm.$vuetify.theme.info).toEqual(colors.blue.base);
    expect(wrapper.vm.$vuetify.theme.success).toEqual(colors.green.base);
    expect(wrapper.vm.$vuetify.theme.toolbar).toEqual(colors.grey.darken4);
    expect(wrapper.vm.$vuetify.theme.background).toEqual('#EFEFEF');
    expect(wrapper.vm.$vuetify.theme.background2).toEqual(colors.grey.lighten2);
  })

  test('Quando o tema for claro, o título do zebrado fica sem classe de cor definida', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.$vuetify.theme.primary = '#FFF';
    let result = wrapper.vm.$colorsService.assessZebraTitle(1);
    expect(result).toEqual("");
  })

  test('Quando o tema for claro, a propriedade de cor do zebrado deve vir preta', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.$vuetify.theme.primary = '#FFF';
    let result = wrapper.vm.$colorsService.assessZebraTitleColor(1);
    expect(result).toEqual("black");
  })

  test('Quando o tema for claro, deve retornar a classe vazia', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.$vuetify.theme.primary = '#FFF';
    let result = wrapper.vm.$colorsService.getClassIfIsDark(null, 0);
    expect(result).toEqual("");
  })
})