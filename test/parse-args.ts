import { parseArgs as polyParseArgs } from '@pkgjs/parseargs'
import t from 'tap'
import { parseArgs as utilParseArgs } from 'util'
import * as UTIL from 'util'

// [version, usesPolyfill]
const cases: [string | undefined, boolean][] = [
  [undefined, true],
  ['v14.99.00', true],
  ['v16.0.0', true],
  ['v16.19.0', false],
  ['v18.0.0', true],
  ['v20.0.0', false],
]

t.plan(cases.length)
for (const [version, usesPolyfill] of cases) {
  t.test(String(version), async t => {
    t.intercept(process, 'version', { value: version })
    const { parseArgs } = (await t.mockImport(
      '../dist/esm/parse-args.js'
    )) as typeof import('../dist/esm/parse-args.js')
    t.equal(parseArgs === polyParseArgs, usesPolyfill)
    t.equal(parseArgs === utilParseArgs, !usesPolyfill)
    const { parseArgs: noUtilPA } = (await t.mockImport(
      '../dist/esm/parse-args.js',
      { util: { ...UTIL, parseArgs: undefined }}
    )) as typeof import('../dist/esm/parse-args.js')
    t.equal(noUtilPA === polyParseArgs, true)
  })
}

