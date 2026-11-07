import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['coverage/**', 'artifacts/**', 'consumer/**'] },
  js.configs.recommended,
  { languageOptions: { globals: globals.node } },
  {
    files: ['lib/**/*.js', 'test/**/*.js', 'test/**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' }
  }
]
