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
	// tsdown's export generation has limitations with:
	// 1. Wildcard locale exports (./locales/*, ./locales/v4/*)
	// 2. Complex export configurations mixing entry points and file globs
	// Therefore, we handle exports management separately in package.json
	// and rely on tsdown only for code bundling, minification, and copying assets.
})
