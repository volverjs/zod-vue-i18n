import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/v4/index.ts',
    ],
    format: 'esm',
    clean: true,
    dts: true,
    minify: true,
    platform: 'neutral',
})
