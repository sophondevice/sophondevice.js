import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

function getTargetES6() {
  return {
    input: 'src/index.ts',
    preserveSymlinks: true,
    output: {
      banner: '/** sophon base library */',
      file: "dist/sophon-base.module.js",
      preserveModules: false,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        compact: false,
        minified: false,
        presets: [
          ['@babel/preset-env', {
            bugfixes: true,
            loose: true,
            modules: false,
            targets: {
              esmodules: true
            }
          }]
        ]
      }),
      terser()
    ]
  };
}

function getTargetTypes() {
  return {
    input: 'src/index.ts',
    output: {
      file: `dist/sophon-base.d.ts`,
    },
    plugins: [
      dts()
    ]
  };
}

export default (args) => {
  return [getTargetES6(), getTargetTypes()];
};
