import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import serve from 'rollup-plugin-serve'

export default [
  {
    input: 'src/adapters/maplibre/index.ts',
    output: {
      file: 'dist/maplibre/map-tile-adapter.min.js',
      format: 'umd',
      name: 'MapTileAdapter',
      sourcemap: true
    },
    plugins: [
      tsc(), 
      nodeResolve(), 
      commonjs()
    ],
  },
  {
    input: 'src/adapters/leaflet/index.ts',
    output: {
      file: 'dist/leaflet/map-tile-adapter.min.js',
      format: 'umd',
      name: 'MapTileAdapter',
      sourcemap: true
    },
    plugins: [
      tsc(), 
      nodeResolve(), 
      commonjs()
    ],
  },
  {
    input: 'src/presets/index.ts',
    output: {
      file: 'dist/presets/map-tile-adapter-presets.min.js',
      format: 'umd',
      name: 'MapTileAdapterPresets',
      sourcemap: true
    },
    plugins: [
      tsc(), 
      nodeResolve(), 
      commonjs(),
      serve({
        contentBase: ['demo', 'dist', 'node_modules'],
        port: 3000
      })
    ],
  }
];
