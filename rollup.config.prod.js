import { exec } from "child_process";
import tsc from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

// Converts aliased imports in `dist/**/*.d.ts` to their relative path
// If left as alises then typescript projects wouldn't understand types
// See: https://github.com/ezolenko/rollup-plugin-typescript2/issues/201#issuecomment-1014261983
const tscAlias = () => {
  return {
      name: "tsAlias",
      writeBundle: () => {
          return new Promise((resolve, reject) => {
              exec("tsc-alias", function callback(error, stdout, stderr) {
                  if (stderr || error) {
                      reject(stderr || error);
                  } else {
                      resolve(stdout);
                  }
              });
          });
      },
  };
};

export default [
  {
    input: 'src/index.ts',
    plugins: [
      tsc(), 
      nodeResolve({  extensions: [".tsx", ".ts", ".jsx", ".js", ".json"] }),
      commonjs(),
      tscAlias()
    ],
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