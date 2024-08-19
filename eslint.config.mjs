import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export default tseslint.config(
  {
    ignores: [
      ...readFileSync(
        resolve(import.meta.dirname, '.prettierignore'),
        'utf8',
      )
        .split('\n')
        .map(v => v.replace(/^\//, '')),
      'eslint.config.mjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/test/**/*.ts'],
    rules: {
      'no-unexpected-multiline': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              name: 'test',
              from: 'package',
              package: 'tap',
            },
          ],
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          minimumDescriptionLength: 0,
        },
      ],
    },
  },
)
