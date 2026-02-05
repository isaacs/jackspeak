#!/usr/bin/env bash

esbuild --minify \
  --sourcemap \
  --platform=node \
  --tree-shaking=true \
  --bundle dist/commonjs/index.js \
  --outfile=dist/commonjs/index.min.js \
  --format=cjs

esbuild --minify \
  --sourcemap \
  --platform=node \
  --tree-shaking=true \
  --bundle dist/esm/index.js \
  --outfile=dist/esm/index.min.js \
  --format=esm
