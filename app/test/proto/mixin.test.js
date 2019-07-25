import { mount } from '@vue/test-utils'
import ColorManager from '../../mixins/service/colorManager'

// Imports a component to serve as a bridge to the mixin
import FLPOSobreLayout from '../../components/FLPOSobreLayout'

// Imports custom elements from Vuetify
import Vue from 'vue'
import Vuetify from 'vuetify'
Vue.use(Vuetify)

// Skips Vuetify warning (v-app missing)
var app = document.createElement('div')
app.setAttribute('data-app', true)
document.body.appendChild(app)

// Sets the mixin in the Vue instance
Vue.use(ColorManager)

// Tests
describe('ColorManager', () => {
  test('Pega corretamente um valor de uma escala ascendente', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    let result = wrapper.vm.getColorFromScale('RdYlBu', 1, 10);
    expect(result).toEqual("rgb(212, 50, 44)");
  })
})