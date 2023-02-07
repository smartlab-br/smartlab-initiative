const meta = require('../router/meta.json')

export default {
  watch: {
    '$route' () {
      this.setMeta()
    }
  },

  created () {
    // if (process.env.VUE_ENV === 'client') { return }

    // const metaData = meta[this.$route.path] || {}
    // this.$ssrContext.title = metaData.title
    // this.$ssrContext.description = metaData.description
    // this.$ssrContext.keywords = metaData.keywords
  },

  mounted () {
    this.setMeta()
  },

  methods: {
    setMeta () {
      if (typeof document === 'undefined') { return }
      const keys = this.$route.path.split('/')
      let key = 'root'
      if (keys.length > 2 && keys[2] !== '') {
        if (keys[1] === 'localidade' || keys[1] === 'mapa' || keys[1] === 'estudo' || keys[1] === 'saibamais') {
          key = keys[1]
        } else {
          key = keys[2]
        }
      } else if (keys.length > 1 && keys[1] !== '') {
        key = keys[1]
      }

      const metaData = meta[key]
      document.title = metaData.title
      document.querySelector('meta[name="description"]').setAttribute('content', metaData.description)
      document.querySelector('meta[name="keywords"]').setAttribute('content', metaData.keywords)
    }
  }
}
