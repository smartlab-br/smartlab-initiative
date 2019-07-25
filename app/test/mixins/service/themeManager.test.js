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
  test('Verifica se pega corretamente o valor da classe primária de BG zebrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    let result = wrapper.vm.assessZebraBG(0);
    expect(result).toEqual("#EFEFEF");
  })

  test('Verifica se pega corretamente o valor da classe secundária de BG zebrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraBG(1);
    expect(result).toEqual("#e0e0e0");
  })

  test('Quando o tema for escuro, o título do zebrado deve vir branco', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$vuetify.theme.background = '#000000';
    let result = wrapper.vm.assessZebraTitle(0);
    expect(result).toEqual("white--text");
  })

  test('Quando o tema for escuro, deve retornar a classe correspondente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getClassIfIsDark(null, 0);
    expect(result).toEqual("theme--dark");
  })

  test('Quando não houver o dado da cor do bg e nenhum índice for informado, volta classe em branco.', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getClassIfIsDark(null, null);
    expect(result).toEqual("");
  })

  test('Quando o tema for escuro, a propriedade de cor do zebrado deve vir branca', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$vuetify.theme.background1 = colors.grey.darken4;
    wrapper.vm.$vuetify.theme.background2 = colors.grey.lighten2;
    let result = wrapper.vm.assessZebraTitleColor(0);
    expect(result).toEqual("white");
  })

  test('Quando o tema for claro, a propriedade de cor do zebrado deve vir preta', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraTitleColor(1);
    expect(result).toEqual("black");
  })

  test('Quando o tema for escuro, a propriedade de cor translúcida do zebrado deve vir branca com opacidade 0.7', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraTitleColor(0, 0.7);
    expect(result).toEqual("rgba(255, 255, 255, 0.7)");
  })

  test('Quando o tema for claro, a propriedade de cor translúcida do zebrado deve vir preta com opacidade 0.7', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraTitleColor(1, 0.7);
    expect(result).toEqual("rgba(0, 0, 0, 0.7)");
  })

  test('Quando o tema for escuro, a propriedade de cor do eixo deve vir branca', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraAxesColor(0);
    expect(result).toEqual("white");
  })

  test('Quando o tema for claro, a propriedade de cor do eixo deve vir cinza', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.assessZebraAxesColor(1);
    expect(result).toEqual(colors.grey.base);
  })

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
    let result = wrapper.vm.assessZebraTitle(1);
    expect(result).toEqual("");
  })

  test('Quando o tema for claro, a propriedade de cor do zebrado deve vir preta', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.$vuetify.theme.primary = '#FFF';
    let result = wrapper.vm.assessZebraTitleColor(1);
    expect(result).toEqual("black");
  })

  test('Quando o tema for claro, deve retornar a classe vazia', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    wrapper.vm.$vuetify.theme.primary = '#FFF';
    let result = wrapper.vm.getClassIfIsDark(null, 0);
    expect(result).toEqual("");
  })
})