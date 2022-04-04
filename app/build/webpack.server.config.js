const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(base, {
  target: 'node',
  devtool: '#source-map',
  entry: './assets/entry-server.js',
  output: {
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  // https://webpack.js.org/configuration/externals/#externals
  // https://github.com/liady/webpack-node-externals
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.GA_ID_BASE': JSON.stringify(process.env.GA_ID_BASE),
      'process.env.GA_ID_DV': JSON.stringify(process.env.GA_ID_DV),
      'process.env.GIT_VIEWCONF_TAG_URL': JSON.stringify(process.env.GIT_VIEWCONF_TAG_URL),
      'process.env.VUE_ENV': '"server"',
      'process.env.GRAVITEE_AM_BASE_URL': JSON.stringify(process.env.GRAVITEE_AM_BASE_URL),
      'process.env.GRAVITEE_AM_CLIENT_ID': JSON.stringify(process.env.GRAVITEE_AM_CLIENT_ID),
      'process.env.GRAVITEE_AM_REDIRECT_URL': JSON.stringify(process.env.GRAVITEE_AM_REDIRECT_URL),
      'process.env.GRAVITEE_AM_MANAGER_BASE_URL': JSON.stringify(process.env.GRAVITEE_AM_MANAGER_BASE_URL),
      'process.env.GRAVITEE_AM_MANAGER_TOKEN': JSON.stringify(process.env.GRAVITEE_AM_MANAGER_TOKEN)
    }),
    new VueSSRServerPlugin()
  ]
})
