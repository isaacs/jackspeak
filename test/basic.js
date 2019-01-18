const t = require('tap')
const { jack, opt, flag, list, count } = require('../')

const options = {
  verbose: count({
    short: 'v',
    negate: {
      short: 'V'
    }
  }),
  asdf: flag({
    short: 'a',
    alias: ['--no-xyz', '-vvv']
  }),
  xyz: flag({
    short: 'x',
    negate: {
      short: 'X'
    }
  }),
  files: list({
    short: 'f'
  }),
  'long-list': list(),
  'long-opt': opt(),
  'default-true': flag({ default: true }),
  'noarg-flag': flag(),
  'alias': opt({
    alias: ['--long-opt=${value}', '--long-list=${value}']
  })

}

const test = (argv, msg) => t.matchSnapshot(jack({ ...options, argv }), msg)

test([], 'empty')

test(['--long-list', '1', '--long-list=2'])

test([
  '-vvxX',
  '-ffoo',
  'positional',
  '--files=bar',
  'arg',
], 'positionals and some expansions')

test([
  process.execPath,
  '-v',
], 'execPath')

test([
  process.execPath,
  require.main.filename,
  '-v',
], 'execPath and main file')

t.matchSnapshot(jack(options), 'using process.argv')

test([
  '-vvfone',
  '-vvf=two',
], 'list using short arg, with and without =')

test([
  '-vvfone',
  '--long-opt=value',
  '--',
  '-vv',
  '--file', 'two',
], 'using --')

test([ '-xa' ], 'short flag alias')
test([ '--alias=foo' ], 'long opt alias')
test(['-vvVvV'], 'negate some verbosity')

t.test('main fn', t => {
  let called = false
  const main = (options) => {
    t.matchSnapshot(options, 'options in main fn')
    t.notOk(called, 'should be called only once')
    called = true
  }
  jack({ ...options, main, argv: ['-v']})
  t.ok(called, 'called main fn')
  t.end()
})

t.test('usage and help strings', t => {
  t.matchSnapshot(jack({ ...options, usage: 'you can use this thing' , argv: []}))
  t.matchSnapshot(jack({ ...options, help: 'you can help this thing' , argv: []}))
  t.end()
})


