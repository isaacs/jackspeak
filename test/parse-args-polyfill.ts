const verProp = Object.getOwnPropertyDescriptor(process, 'version')
if (!verProp) throw new Error('no version on process??')
Object.defineProperty(process, 'version', {
  value: undefined,
  configurable: true,
  writable: true,
})

import { parseArgs } from '../dist/cjs/parse-args.js'
import { parseArgs as polyfillPA } from '@pkgjs/parseargs'

import t from 'tap'
t.teardown(() => { Object.defineProperty(process, 'version', verProp) })

t.equal(parseArgs, polyfillPA, 'got polyfill')

t.test('import() style polyfill', async t => {
  const { parseArgs } = await import('../dist/mjs/parse-args.js')
  t.equal(parseArgs, polyfillPA, 'got polyfill via import()')
})
