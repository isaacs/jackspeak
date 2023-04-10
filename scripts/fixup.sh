#!/usr/bin/env bash

rm -rf dist
mv dist-tmp dist

cat >dist/cjs/package.json <<!EOF
{
  "type": "commonjs"
}
!EOF

rm -f dist/cjs/parse-args.*
mv dist/cjs/parse-args-cjs.js dist/cjs/parse-args.js
mv dist/cjs/parse-args-cjs.d.ts dist/cjs/parse-args.d.ts

rm -f dist/mjs/parse-args.*
mv dist/mjs/parse-args-esm.js dist/mjs/parse-args.js
mv dist/mjs/parse-args-esm.d.ts dist/mjs/parse-args.d.ts

cat >dist/mjs/package.json <<!EOF
{
  "type": "module"
}
!EOF
