import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import serve from 'rollup-plugin-serve'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.min.js',
    format: 'umd',
    name: 'MapTileAdapter',
    sourcemap: true
  },
  plugins: [
    tsc({
      include: ["src/**/*"]
    }), 
    nodeResolve(), 
    commonjs(),
    serve({
      contentBase: ['demo', 'dist'],
      port: 3000
    })
  ],
}
