import { mount } from '@vue/test-utils'

// Imports custom elements from Vuetify
import Vue from 'vue'
import Vuetify from 'vuetify'
import FLPOSobreLayout from '~/components/FLPOSobreLayout'
Vue.use(Vuetify)

// Skips Vuetify warning (v-app missing)
const app = document.createElement('div')
app.setAttribute('data-app', true)
document.body.appendChild(app)

// Tests
describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(FLPOSobreLayout, { sync: false })
    expect(wrapper.vm).toBeTruthy()
  })
})
