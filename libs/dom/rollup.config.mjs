import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const externals = [/@sophon\/base/, /@sophon\/device/];

function getTargetES6() {
  return {
    external: id => {
      for (const m of externals) {
        if (m.test(id)) {
          return true;
        }
      }
    },
    input: 'src/index.ts',
    preserveSymlinks: true,
    output: {
      banner: '/** sophon dom library */',
      dir: "module",
      preserveModules: true,
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
      file: `dist/index.d.ts`,
    },
    plugins: [
      dts()
    ]
  };
}

export default (args) => {
  return [getTargetES6()/*, getTargetTypes()*/];
};
