import path from 'path';
import { fileURLToPath } from 'url';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const cwd = path.dirname(__filename);

const input = path.resolve(cwd, '..', '..', '..', 'libs', 'device', 'src', 'index.ts');
const outdir = path.resolve(cwd, '..', '..', 'build', '@sophon', 'base');

function getTargetES6() {
  return {
    external: id => /@sophon\/base/.test(id),
    input: input,
    preserveSymlinks: true,
    output: {
      banner: '/** sophon base library */',
      dir: cwd,
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
