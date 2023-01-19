import { mount } from '@vue/test-utils'
import FLPOSobreLayout from '~/components/FLPOSobreLayout'

// Imports custom elements from Vuetify
import Vue from 'vue'
import Vuetify from 'vuetify'
Vue.use(Vuetify)

// Skips Vuetify warning (v-app missing)
var app = document.createElement('div')
app.setAttribute('data-app', true)
document.body.appendChild(app)

// Tests
describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    expect(wrapper.vm).toBeTruthy();
  })
})