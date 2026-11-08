import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/', 'planning/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['*.cjs', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      // Fremdtext (Chat, APIs) nie als HTML einsetzen - harness/untrusted-input.md
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'textContent verwenden (untrusted input).' },
        { property: 'outerHTML', message: 'textContent verwenden (untrusted input).' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'Kein HTML aus Strings einsetzen (untrusted input).',
        },
      ],
    },
  },
  {
    // core ist rein: kein DOM, kein Netz, kein Storage
    files: ['src/core/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'localStorage',
        'fetch',
        'WebSocket',
        'Audio',
      ],
    },
  },
)
