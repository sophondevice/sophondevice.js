import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

function getTargetES6() {
  return {
    external: function (id) {
      return false;
    },
    input: 'src/index.ts',
    preserveSymlinks: true,
    output: {
      banner: '/** sophon device library */',
      file: "dist/sophon-device.module.js",
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
    preserveSymlinks: true,
    output: {
      file: `dist/sophon-device.d.ts`,
    },
    plugins: [
      dts()
    ]
  };
}

export default (args) => {
  return [getTargetES6(), getTargetTypes()];
};
