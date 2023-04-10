const verProp = Object.getOwnPropertyDescriptor(process, 'version')
if (!verProp) throw new Error('no version on process??')
Object.defineProperty(process, 'version', {
  value: 'v18.14.0',
  configurable: true,
  writable: true,
})

import { parseArgs } from '../dist/cjs/parse-args.js'
import { parseArgs as polyfillPA } from '@pkgjs/parseargs'
import * as util from 'util'

import t from 'tap'
t.teardown(() => { Object.defineProperty(process, 'version', verProp) })

t.not(parseArgs, polyfillPA, 'got util.parseArgs')
t.equal(parseArgs, util.parseArgs, 'got util.parseArgs')

t.test('import() style polyfill', async t => {
  const { parseArgs } = await import('../dist/mjs/parse-args.js')
  t.not(parseArgs, polyfillPA, 'got util.parseArgs via import()')
  t.equal(parseArgs, util.parseArgs, 'got util.parseArgs via import()')
})
