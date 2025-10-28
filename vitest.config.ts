import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'node',
		include: ['**/test/**/*.test.ts', '**/test/**/*.test.js'],
		exclude: ['dist'],
		globals: true,
	},
})
