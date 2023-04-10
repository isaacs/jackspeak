import * as util from 'util'

const pv =
  typeof process === 'object' &&
  !!process &&
  typeof process.version === 'string'
    ? process.version
    : 'v0.0.0'
const pvs = pv
  .replace(/^v/, '')
  .split('.')
  .map(s => parseInt(s, 10))

let { parseArgs: pa } = util
if (!pa || pvs[0] > 18 || pvs[1] < 11) {
  pa = require('@pkgjs/parseargs').parseArgs
}

export const parseArgs = pa