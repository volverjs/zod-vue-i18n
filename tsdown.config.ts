import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		v4: 'src/v4/index.ts',
	},
	format: ['esm'],
	dts: true,
	platform: 'neutral',
	exports: {
		auto: true,
	},
	outDir: 'dist',
})
