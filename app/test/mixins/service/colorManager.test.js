import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import ColorsService from '../../../assets/service/singleton/colorsService'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.prototype.$colorsService = new ColorsService();

// Tests
describe('ColorManager', () => {
  test('Pega corretamente um valor de uma escala divergente ascendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorFromScale('RdYlBu', 1, 10);
    expect(result).toEqual("rgb(212, 50, 44)");
  })

  test('Pega corretamente um valor de uma escala divergente descendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorFromScale('RdYlBu', 10, 10, 'desc');
    expect(result).toEqual("rgb(49, 54, 149)");
  })

  test('Pega corretamente um valor de uma escala categórica ascendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorFromCategoricalScale('Set3', 1);
    expect(result).toEqual("#ffffb3");
  })

  test('Pega corretamente um valor de uma escala categórica descendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorFromCategoricalScale('Set3', 8, 'desc');
    expect(result).toEqual("#d9d9d9");
  })

  test('Pega corretamente a escala categórica ascendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale();
    expect(result).toEqual(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);
  })

  test('Pega corretamente a escala categórica descendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, null, 'desc');
    expect(result).toEqual(["#ffed6f", "#ccebc5", "#bc80bd", "#d9d9d9", "#fccde5", "#b3de69", "#fdb462", "#80b1d3", "#fb8072", "#bebada", "#ffffb3", "#8dd3c7"]);
  })

  test('Retorna corretamente uma escala categórica ascendente padrão e ignora os níveis definidos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, null, 'asc', 6);
    expect(result).toEqual(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);
  })

  test('Pega corretamente a escala divergente ascendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'divergent');
    expect(result).toEqual(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"]);
  })

  test('Pega corretamente a escala divergente descendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'divergent', 'desc');
    expect(result).toEqual(["#4575b4","#74add1","#abd9e9","#e0f3f8","#fee090","#fdae61","#f46d43","#d73027"]);
  })

  test('Pega corretamente a escala divergente ascendente padrão com níveis definidos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'divergent', 'asc', 10);
    expect(result).toEqual(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"]);
  })

  test('Pega corretamente a escala de única cor ascendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'singleHue');
    expect(result).toEqual(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]);
  })

  test('Pega corretamente a escala de única cor descendente padrão', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'singleHue', 'desc');
    expect(result).toEqual(["#084594","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef","#deebf7","#f7fbff"]);
  })

  test('Pega corretamente a escala de única cor ascendente padrão com níveis definidos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale(null, 'singleHue', 'asc', 4);
    expect(result).toEqual(["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]);
  })

  test('Pega corretamente a escala cor definida ascendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale('RdYlGn', 'divergent');
    expect(result).toEqual(["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"]);
  })

  test('Pega corretamente a escala cor definida descendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale('RdYlGn', 'divergent', 'desc');
    expect(result).toEqual(["#1a9850","#66bd63","#a6d96a","#d9ef8b","#fee08b","#fdae61","#f46d43","#d73027"]);
  })

  test('Pega corretamente a escala de única cor ascendente definida com níveis determinados', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getColorScale('RdYlGn', 'divergent', 'asc', 10);
    expect(result).toEqual(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]);
  })

  test('Verifica se pega corretamente o valor da classe primária de BG zebrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.changeTheme('default'); // Sets initial theme
    let result = wrapper.vm.$colorsService.assessZebraBG(0);
    expect(result).toEqual("#EFEFEF");
  })

  test('Verifica se pega corretamente o valor da classe secundária de BG zebrado', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraBG(1);
    expect(result).toEqual("#e0e0e0");
  })

  test('Quando o tema for escuro, deve retornar a classe correspondente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getClassIfIsDark(null, 0);
    expect(result).toEqual("theme--dark");
  })

  test('Quando não houver o dado da cor do bg e nenhum índice for informado, volta classe em branco.', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.getClassIfIsDark(null, null);
    expect(result).toEqual("");
  })

  test('Quando o tema for escuro, o título do zebrado deve vir branco', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$vuetify.theme.background = '#000000';
    let result = wrapper.vm.$colorsService.assessZebraTitle(0);
    expect(result).toEqual("white--text");
  })

  test('Quando o tema for escuro, a propriedade de cor do zebrado deve vir branca', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.$vuetify.theme.background1 = colors.grey.darken4;
    wrapper.vm.$vuetify.theme.background2 = colors.grey.lighten2;
    let result = wrapper.vm.$colorsService.assessZebraTitleColor(0);
    expect(result).toEqual("white");
  })

  test('Quando o tema for claro, a propriedade de cor do zebrado deve vir preta', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraTitleColor(1);
    expect(result).toEqual("black");
  })

  test('Quando o tema for escuro, a propriedade de cor translúcida do zebrado deve vir branca com opacidade 0.7', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraTitleColor(0, 0.7);
    expect(result).toEqual("rgba(255, 255, 255, 0.7)");
  })

  test('Quando o tema for claro, a propriedade de cor translúcida do zebrado deve vir preta com opacidade 0.7', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraTitleColor(1, 0.7);
    expect(result).toEqual("rgba(0, 0, 0, 0.7)");
  })

  test('Quando o tema for escuro, a propriedade de cor do eixo deve vir branca', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraAxesColor(0);
    expect(result).toEqual("white");
  })

  test('Quando o tema for claro, a propriedade de cor do eixo deve vir cinza', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.$colorsService.assessZebraAxesColor(1);
    expect(result).toEqual(colors.grey.base);
  })
})