import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import path from 'node:path';
import { fileURLToPath } from 'node:url'
import glob from 'glob'

const inputs = Object.fromEntries(
  glob.sync('src/**/!(__mocks__)/*[!test,!e2e].ts').map(file => [
    // This remove `src/` as well as the file extension from each file, so e.g.
    // src/nested/foo.js becomes nested/foo
    path.relative('src', file.slice(0, file.length - path.extname(file).length)),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    fileURLToPath(new URL(file, import.meta.url))
  ])
);

export default [
  {
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
  }
];
