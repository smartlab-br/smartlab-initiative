import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"
import colors from "vuetify/lib/util/colors.mjs"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: "default",
      themes: {
        default: {
          colors: {
            primary: colors.grey.darken4,
            secondary: colors.grey.darken3,
            // surface: "#FFFFFF",
            // "on-surface": "#FFFFFF",
            // "on-background": "#FFFFFF",
            accent: colors.cyan.accent1,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        td: {
          colors: {
            primary: colors.blueGrey.darken4,
            secondary: colors.blueGrey.lighten4,
            accent: colors.cyan.accent4,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        te: {
          colors: {
            primary: colors.brown.darken4,
            secondary: colors.brown.lighten4,
            accent: colors.cyan.accent4,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        sst: {
          colors: {
            primary: colors.teal.darken4,
            secondary: colors.teal.lighten4,
            accent: colors.orange.accent2,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        ti: {
          colors: {
            primary: colors.lightBlue.darken4,
            secondary: colors.blue.lighten4,
            accent: colors.orange.accent2,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        des: {
          colors: {
            primary: colors.deepPurple.darken4,
            secondary: colors.deepPurple.lighten4,
            accent: colors.yellow.accent4,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        cov: {
          colors: {
            primary: colors.deepOrange.darken4,
            secondary: colors.deepOrange.lighten4,
            accent: colors.teal.accent4,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        },
        est: {
          colors: {
            primary: colors.blueGrey.darken4,
            secondary: colors.blueGrey.lighten4,
            accent: colors.cyan.accent4,
            error: colors.red.base,
            warning: colors.amber.base,
            info: colors.blue.base,
            success: colors.green.base,
            // Custom
            background: "#EFEFEF",
            background2: colors.grey.lighten2
          }
        }
      }
    }
  })
  app.vueApp.use(vuetify)
})