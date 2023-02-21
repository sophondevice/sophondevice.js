import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

function getTargetES6() {
  return {
    external: id => /@sophon\/base/.test(id),
    input: 'src/index.ts',
    preserveSymlinks: true,
    output: {
      banner: '/** sophon base library */',
      dir: "module",
      preserveModules: true,
      format: 'esm',
      sourcemap: true,
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
      // terser()
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
