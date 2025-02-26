// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            provider: 'v8', // or 'v8'
            reporter: ['text', 'json', 'html'],
            ignoreEmptyLines: true,
            exclude: ['node_modules', 'tests', 'vitest.config.ts', '.svelte-kit', 'coverage', 'static', 'playwright.config.ts', 'svelte.config.js', 'postcss.config.cjs', 'tailwind.config.cjs', 'vite.config.js', 'app.d.ts'],
        },
    },
});