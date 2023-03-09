import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

function getTargetES6() {
  return {
    input: './src/index.ts',
    preserveSymlinks: true,
    output: {
      banner: '/** sophon base library */',
      dir: 'dist',
      preserveModules: true,
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript(),
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        compact: false,
        minified: false,
        presets: [
          [
            '@babel/preset-env',
            {
              bugfixes: true,
              loose: true,
              modules: false,
              targets: {
                esmodules: true
              }
            }
          ]
        ]
      }),
      // terser()
      copy({
        targets: [
          {
            src: './package.pub.json',
            dest: 'dist',
            rename: 'package.json'
          },
          {
            src: './src',
            dest: 'dist'
          }
        ]
      })
    ]
  };
}

export default (args) => {
  return [getTargetES6()];
};
