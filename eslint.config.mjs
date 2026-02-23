import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: [
            'dist/**',
            'dist-frontend/**',
            'node_modules/**',
            'src/frontend/**',
            'spec/**',
            'tests/**',
            '*.js',
        ],
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
);
