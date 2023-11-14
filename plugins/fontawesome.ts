import { library, config } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faInstagram, faGithub, faDocker, faCreativeCommons, faOsi } from "@fortawesome/free-brands-svg-icons"

library.add(faInstagram, faGithub, faDocker, faCreativeCommons, faOsi)

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon)
})