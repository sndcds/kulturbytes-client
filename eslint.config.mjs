import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'

export default [
  { ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'pnpm-lock.yaml'] },
  { files: ['**/*.{js,mjs}'], rules: js.configs.recommended.rules },
  ...vue.configs['flat/essential'],
  { files: ['**/*.ts'], languageOptions: { parser: tseslint.parser } },
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      // Nuxt generates component names and imports; single-word existing names are intentional.
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },
  { files: ['app/pages/events/index.vue'], rules: { 'vue/valid-template-root': 'off' } },
]
