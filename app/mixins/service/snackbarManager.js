const SnackbarManager = {
  install(Vue, options) {
    Vue.mixin({
      methods: {
        sendError(message) {
          this.$emit('showSnackbar', { color : 'error', text: message });
        },
        openBugDialog(cardTitle){
          this.$emit('showBugDialog', cardTitle);
        }
      }
    })
  }
}

export default SnackbarManager;