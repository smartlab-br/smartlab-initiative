const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
  entry: {
    app: './assets/entry-client.js'
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.GA_ID_BASE': JSON.stringify(process.env.GA_ID_BASE),
      'process.env.GA_ID_DV': JSON.stringify(process.env.GA_ID_DV),
      'process.env.GIT_VIEWCONF_TAG_URL': JSON.stringify(process.env.GIT_VIEWCONF_TAG_URL),
      'process.env.VUE_ENV': '"client"',
      // 'process.env.DATAHUB_API_BASE_URL': JSON.stringify(process.env.DATAHUB_API_BASE_URL || 'http://localhost:8080'),
      // 'process.env.DATAHUB_APP_KEY': JSON.stringify(process.env.DATAHUB_APP_KEY || 'key'),
      // 'process.env.MAILER_API_BASE_URL': JSON.stringify(process.env.MAILER_API_BASE_URL || 'http://localhost:8080'),
      // 'process.env.MAILER_APP_KEY': JSON.stringify(process.env.MAILER_APP_KEY || 'key'),
      // 'process.env.ACIDENTOMETROS_API_BASE_URL': JSON.stringify(process.env.ACIDENTOMETROS_API_BASE_URL || 'http://localhost:8080'),
      // 'process.env.ACIDENTOMETROS_APP_KEY': JSON.stringify(process.env.ACIDENTOMETROS_APP_KEY || 'key'),
      'process.env.GOOGLE_CLIENTID': JSON.stringify(process.env.GOOGLE_CLIENTID | 'key'),
      'process.env.GOOGLE_CLIENTSECRET': JSON.stringify(process.env.GOOGLE_CLIENTSECRET || 'key'),
      'process.env.FACEBOOK_CLIENTID': JSON.stringify(process.env.FACEBOOK_CLIENTID || 'key'),
      'process.env.FACEBOOK_CLIENTSECRET': JSON.stringify(process.env.FACEBOOK_CLIENTSECRET || 'key')
      
    }),
    // extract vendor chunks for better caching
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // a module is extracted into the vendor chunk if...
        return (
          // it's inside node_modules
          /node_modules/.test(module.context) &&
          // and not a CSS file (due to extract-text-webpack-plugin limitation)
          !/\.css$/.test(module.request)
        )
      }
    }),
    // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // on every build.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new VueSSRClientPlugin()
  ]
})

module.exports = config