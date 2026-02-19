import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",

    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ]
  }
})
