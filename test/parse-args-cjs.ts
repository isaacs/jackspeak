import t from 'tap'

import { createRequire } from 'module'
const req = createRequire(import.meta.url)
const { parseArgs: polyParseArgs } = req('@pkgjs/parseargs')
const { parseArgs: utilParseArgs } = req('util')
const UTIL = req('util')

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
    const { parseArgs } = t.mockRequire('../dist/commonjs/parse-args.js', {
      '@pkgjs/parseargs': { parseArgs: polyParseArgs },
      util: UTIL,
    }) as typeof import('../dist/commonjs/parse-args.js')
    t.equal(parseArgs === polyParseArgs, usesPolyfill)
    t.equal(parseArgs === utilParseArgs, !usesPolyfill)
    const { parseArgs: noUtilPA } = t.mockRequire(
      '../dist/commonjs/parse-args.js',
      {
        '@pkgjs/parseargs': { parseArgs: polyParseArgs },
        util: { ...UTIL, parseArgs: undefined },
      }
    ) as typeof import('../dist/commonjs/parse-args.js')
    t.equal(noUtilPA === polyParseArgs, true)
  })
}
