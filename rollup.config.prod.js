import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/index.ts',
    plugins: [tsc(), nodeResolve(), commonjs()],
    output: [
      {
        file: 'dist/bundle.cjs',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/bundle.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/bundle.min.js',
        format: 'umd',
        name: 'MapTileAdapter',
        sourcemap: true,
        plugins: [terser()]
      }
    ]
  }
]