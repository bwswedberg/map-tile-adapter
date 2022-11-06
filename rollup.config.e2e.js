import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.min.js',
      format: 'umd',
      name: 'MapTileAdapter',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    tsc(), 
    nodeResolve({  extensions: [".tsx", ".ts", ".jsx", ".js", ".json"] }),
    commonjs(),
    serve({
      contentBase: ['test/assets', 'test/pages', 'dist', 'node_modules/maplibre-gl/dist'],
      port: 3000
    })
  ]
};
