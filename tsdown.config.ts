import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/v4/index.ts',
    ],
    format: 'esm',
    clean: true,
    dts: true,
    tsconfig: './tsconfig.build.json',
    minify: true,
    platform: 'neutral',
})
