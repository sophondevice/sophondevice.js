import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcdir = path.join(__dirname, 'src');
const srcfiles = [];

fs.readdirSync(srcdir).filter((dir) => {
  const fullpath = path.join(srcdir, dir);
  if (fs.statSync(fullpath).isDirectory()) {
    const main = path.join(fullpath, 'main.ts');
    const html = path.join(fullpath, 'index.html');
    if (fs.existsSync(main) && fs.statSync(main).isFile() && fs.existsSync(html) && fs.statSync(html).isFile()) {
      console.log('src files added: ' + main);
      srcfiles.push([
        main,
        path.join(__dirname, 'dist', `${dir}.js`),
        html,
        path.join(__dirname, 'dist', `${dir}.html`)
      ]);
    }
  }
});

function getTargetES6(input, output) {
  console.log(input, ',', output);
  return {
    input: input,
    preserveSymlinks: false,
    output: {
      banner: '/** sophon dom library */',
      file: output,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
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
      // terser()
    ]
  };
}

export default (args) => {
  const targets = srcfiles.map(f => getTargetES6(f[0], f[1]));
  console.log(JSON.stringify(targets));
  return targets;
};
