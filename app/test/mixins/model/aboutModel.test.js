import { mount } from '@vue/test-utils'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

require('../../setup.js');

import AboutModel from '../../../mixins/model/aboutModel'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../../components/FLPOSobreLayout'

// Sets the mixin in the Vue instance
Vue.use(AboutModel)

// Tests
describe('AboutModel', () => {
  const aboutYaml = {
    plataforma: {
      tab: "Sobre a Plataforma",
      title: "",
      sections: [
        { title: "Sobre a Plataforma", type: "text" }
      ]
    },
    equipe: {
      tab: "Equipe",
      title: "Equipe",
      sections: [
        { title: "Equipe de Ciência de Dados e Desenvolvimento Ténico e Visual",
          type: "list-avatar",
          list: [
            { name: "Marcel Alberto Martinelli (MPT)",
              values: ["Cientista de Dados", "Engenheiro de Dados", "Engenheiro DevOps"]
            },
            { name: "Rodrigo Moreira Fagundes (MPT)",
              avatar: "/static/avatar/equipe/rodrigofagundes.png",
              values: ["Cientista de Dados", "Designer de API", "Engenheiro Full-stack", "Quality Assurance"]
            },
            { name: "Daniela de Miranda Guerra (MPT)",
              values: ["Cientista de Dados", "Engenheira de Front-end"]
            },
            { name: "Charles Henrique Gonçalves Santos (MPT)",
              values: ["Engenheiro de Operações", "DevOps"]
            },
            { name: "Paulo Francisco Vieira de Araújo (MPT)",
              values: ["Cientista de Dados", "Engenheiro de Front-end"]
            }
          ]
        }
      ]
    },
    parceiros: {
      tab: "Parceiros",
      title: "Parceiros",
      sections: [
        { title: "",
          type: "list-avatar",
          list: [
            { name: "Ministério da Fazenda e Previdência Social",
              avatar: "/static/avatar/parceiros/fazenda.png"
            },
            { name: "Ministério da Justiça",
              avatar: "/static/avatar/parceiros/justica.png",
              values: [ "Departamento de Polícia Federal" ]
            }
          ]
        }
      ]
    },
    history: {
      tab: "Nossa História",
      title: "Nossa História",
      sections: [
        { title: "", type: "timeline",
          list: [
            { title: "AGOSTO DE 2014",
              content: "Evento 1"
            },
            { title: "AGOSTO DE 2015", 
              content: "Evento 2"
            }
          ]
        }
      ]
    }
  };
  
  test('Pega corretamente conteúdo inteiro do about', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.about = aboutYaml;
    let result = wrapper.vm.getFullAbout();
    expect(result).toEqual(aboutYaml);
  })

  test('Pega corretamente as seções do atributo plataforma do about', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.about = aboutYaml;
    let result = wrapper.vm.getAbout();
    expect(result).toEqual(aboutYaml.plataforma.sections);
  })

  test('Pega corretamente a lista da primeira seção do atributo history do about', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.about = aboutYaml;
    let result = wrapper.vm.getHistory();
    expect(result).toEqual(aboutYaml.history.sections[0].list);
  })

  test('Pega corretamente a lista da primeira seção do atributo partners do about', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    wrapper.vm.about = aboutYaml;
    let result = wrapper.vm.getPartners();
    expect(result).toEqual(aboutYaml.parceiros.sections[0].list);
  })
})
