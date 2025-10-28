import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		v4: 'src/v4/index.ts',
	},
	format: ['esm'],
	dts: {
		resolve: true,
	},
	sourcemap: true,
	minify: true,
	platform: 'neutral',
	outDir: 'dist',
	copy: 'locales',
	// Note: exports are managed manually in package.json
	// tsdown's auto export generation doesn't fully support
	// locale wildcard exports, so we handle this separately
})
