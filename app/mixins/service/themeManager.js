import colors from 'vuetify/es5/util/colors'

const ThemeManager = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          themeLibrary: {
            default: {
              primary: colors.grey.darken4,
              secondary: colors.grey.darken3,
              accent: colors.cyan.accent1,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.grey.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            td: {
              primary: colors.blueGrey.darken4,
              secondary: colors.blueGrey.lighten5,
              accent: colors.cyan.accent4,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.blueGrey.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            te: {
              primary: colors.brown.darken4,
              secondary: colors.brown.lighten4,
              accent: colors.cyan.accent4,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.brown.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            sst: {
              primary: colors.teal.darken4,
              secondary: colors.teal.lighten5,
              accent: colors.orange.accent2,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.teal.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            ti: {
              primary: colors.lightBlue.darken4,
              secondary: colors.blue.lighten4,
              accent: colors.orange.accent2,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.lightBlue.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            des: {
              primary: colors.deepPurple.darken4,
              secondary: colors.deepPurple.lighten5,
              accent: colors.yellow.accent4,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.deepPurple.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            },
            est: {
              primary: colors.blueGrey.darken4,
              secondary: colors.blueGrey.lighten5,
              accent: colors.cyan.accent4,
              error: colors.red.base,
              warning: colors.amber.base,
              info: colors.blue.base,
              success: colors.green.base,
              // Custom
              toolbar: colors.blueGrey.darken4,
              background: "#EFEFEF",
              background2: colors.grey.lighten2
            }
          }
        }
      },
      methods: {
        getObsTheme(observatorio) {
          return this.themeLibrary[observatorio];
        },
        
        changeTheme(observatorio) {
          if (this.themeLibrary[observatorio]) {
            this.$vuetify.theme = this.themeLibrary[observatorio];
          }
        },
        
        assessZebraBG(index) {
          var alternativa = index % 2;
          if (alternativa == 1) {
            return this.$vuetify.theme.background2;
          } else {
            return this.$vuetify.theme.background;
          }
        },

        getClassIfIsDark(hex, index){
          if (hex == null) {
            if (index != null) {
              hex = this.assessZebraBG(index);
            } else {
              return "";
            }
          }
          hex = hex.replace('#', '');
          
          const c_r = parseInt(hex.substr(0, 2), 16);
          const c_g = parseInt(hex.substr(2, 2), 16);
          const c_b = parseInt(hex.substr(4, 2), 16);
          const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;

          if (brightness < 155) {
             return "theme--dark";
          } else {
            return "";
          }          
        },
        
        assessZebraTitle(index = 0) {
          if (this.getClassIfIsDark(this.assessZebraBG(index)) == "theme--dark"){
            return 'white--text';
          } else {
            return '';
          }
        },
        assessZebraTitleColor(index = 0, opacity = null) {
          if (this.getClassIfIsDark(this.assessZebraBG(index)) == "theme--dark"){
            if (opacity == null) return 'white';
            return "rgba(255, 255, 255, " + opacity + ")";
          } else {
            if (opacity == null) return 'black';
            return "rgba(0, 0, 0, " + opacity + ")";
          }
        },
        assessZebraAxesColor(index = 0) {
          if (this.getClassIfIsDark(this.assessZebraBG(index)) == "theme--dark"){
            return 'white';
          } else {
            return colors.grey.base;
          }
        }
      }
    })
  }
}

export default ThemeManager;