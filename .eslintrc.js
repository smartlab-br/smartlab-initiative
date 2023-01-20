module.exports = {
  root: true,
  env: {
    browser: true,
    'jest/globals': true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  plugins: [
    'jest'
  ],
  // add your custom rules here
  rules: {
    eqeqeq: 'warn',
    camelcase: 'warn',
    'vue/no-v-text-v-html-on-component': 'warn'
  },
  ignorePatterns: ['**/node_modules/**']
}
