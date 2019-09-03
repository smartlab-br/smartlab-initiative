import colors from 'vuetify/es5/util/colors'

const ThemeManager = {
  install(Vue, options) {
    Vue.mixin({
      data() {
        return {
          
        }
      },
      methods: {
        
        
        changeTheme(observatorio) {
          if (this.themeLibrary[observatorio]) {
            this.$vuetify.theme = this.themeLibrary[observatorio];
          }
        },
        
        
        
        
      }
    })
  }
}

export default ThemeManager;