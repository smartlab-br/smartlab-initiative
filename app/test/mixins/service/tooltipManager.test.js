import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import colors from 'vuetify/es5/util/colors'
import TooltipBuildingService from '../../../assets/service/singleton/tooltipBuildingService'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.prototype.$tooltipBuildingService = new TooltipBuildingService();

// Tests
describe('ThemeManager', () => {
  const remove_list = ["remove", "delete"];

  test('Remove textos de uma lista de labels', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let label = [
      "testeremovedelete",
      "testeremove2",
      "testedelete3",
      "teste4"
    ];

    let result = wrapper.vm.$tooltipBuildingService.constructor.removeFromLabel(label, remove_list);
    expect(result).toEqual(["teste","teste2","teste3","teste4"]);
  })

  test('Remove textos de uma lista de labels', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let label = "testeremovedelete";

    let result = wrapper.vm.$tooltipBuildingService.constructor.removeFromLabel(label, remove_list);
    expect(result).toEqual("teste");
  })

  test('Monta um default quando não há indicação dos campos', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let indicador = { cd_indicador: 1, nu_competencia: 2099, vl_indicador: 123.45 };
    
    let result = wrapper.vm.$tooltipBuildingService.constructor.defaultTooltip(indicador, null, null, remove_list);
    expect(result).toEqual('Tooltip!');
  })

  test('Monta um default tooltip com valor único', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })

    let indicador = { cd_indicador: 1, nu_competencia: 2020, vl_indicador: 123.45 };
    let vals = [{ text: "Indicador", value: "cd_indicador" },
                { text: "Ano", value: "nu_competencia" },
                { text: "Valor", value: "vl_indicador" }];

    let result = wrapper.vm.$tooltipBuildingService.constructor.defaultTooltip(indicador, null, vals, remove_list);
    expect(result).toEqual(
      "<p class='headline-obs'><b>1</b></p><hr class='tooltip_divider'>"+
      "<table width='100%' style='max-width:350px'>"+
      "<tr style='vertical-align:top'>"+
      "<td class='font-weight-bold'>Ano:</td><td class='text-xs-right'>2020</td></tr>"+
      "<tr style='vertical-align:top'>"+
      "<td class='font-weight-bold'>Valor:</td><td class='text-xs-right'>123.45</td>"+
      "</tr></table>"
    );
  })

  // test('Monta um default tooltip com array de valores', () => {
  //   const wrapper = mount(FLPOSobreLayout, { sync: false })

  //   let indicador = { cd_indicador: 1, lista: [1, 2], nu_competencia: 2099, vl_indicador: 123.45 };
  //   let vals = [
  //     { text: "Código", value: "cd_indicador" },
  //     { text: "Ano", value: "nu_competencia" },
  //     { text: "Valor", value: "vl_indicador" },
  //     { text: "Lista", value: "lista" }
  //   ];

  //   let result = wrapper.vm.$tooltipBuildingService.constructor.defaultTooltip(indicador, null, vals, remove_list);
  //   expect(result).toEqual(
  //     "<p class='headline-obs'><b>1</b></p><hr class='tooltip_divider'>"+
  //     "<table width='100%'></table><table width='100%'><tr><td class="+
  //     "'font-weight-bold'>Ano:</td><td class='text-xs-right'>2099</td>"+
  //     "</tr></table><table width='100%'><tr><td class='font-weight-bold'>"+
  //     "Valor:</td><td class='text-xs-right'>123.45</td></tr></table>"+
  //     "<table width='100%'><tr><td class='font-weight-bold'>Lista:</td>"+
  //     "<td class='text-xs-right'>1</td></tr><tr><td "+
  //     "class='font-weight-bold'>Lista:</td><td class='text-xs-right'>2"+
  //     "</td></tr></table>"
  //   );
  // })

})