const t = require('tap')
const { parse, env, jack, opt, flag, list, count, num } = require('../')

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
  implication: flag({
    implies: {
      xyz: true,
      verbose: 9,
      files: [ 'deadbeat', 'folly', 'frump', 'lagamuffin' ]
    }
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
  require.main.filename,
  '-v',
], 'execPath and main file')

t.matchSnapshot(parse(options), 'parse only, using process.argv')

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
test(['--implication'], 'imply some things')
test(['--implication', '--no-xyz'], 'un-imply some things')
test(['--no-xyz', '--implication'], 're-imply some things')

t.test('main fn', t => {
  let called = false
  const main = (options) => {
    t.matchSnapshot(options, 'options in main fn')
    t.notOk(called, 'should be called only once')
    called = true
  }
  jack({ ...options, main }, ['-v'])
  t.ok(called, 'called main fn')
  t.end()
})

t.test('usage and help strings', t => {
  t.matchSnapshot(jack({ ...options, usage: 'you can use this thing' }, []))
  t.matchSnapshot(jack({ ...options, help: 'you can help this thing' }, []))
  t.end()
})

t.test('original, parsed, explicit', t => {
  const res = jack(options, ['-vaxv'])
  t.matchSnapshot(res._.explicit, 'explicit')
  t.matchSnapshot(res._.original, 'original')
  t.matchSnapshot(res._.parsed, 'parsed')
  t.end()
})

t.test('env things', t => {
  jack({
    argv: ['--implier', '--no-implier'],
    env: {
      lines: `a,b,c,d`,
      flagon: '1',
      flagoff: '0',
      flagmaybe: '',
      num1: '1',
      num2: '',
      nums: '1,2,,3,4,',
      counter: '1,0,1,0,0,0,1'
    },
    implied: flag(),
    unset: num({ envDefault: 'unset', default: 7, min: 2 }),
    one: num({ envDefault: 'num1' }),
    numbers: list(num({ envDefault: 'nums', delimiter: ',' })),
    counter: env(count({ delimiter: ',' })),
    foo: env({
      default: 'baz',
    }),
    lines: env(list({
      delimiter: ',',
    })),
    nums: env(list(num({ max: 5, delimiter: ',' }))),
    dreams: env(list({ delimiter: ',' })),
    flagon: env(flag({
      implies: {
        implied: true,
      },
    })),
    flagoff: env(flag()),
    flagmaybe: env(flag()),
    num1: env(num()),
    num2: num(env()),
    implier: flag({
      implies: {
        implied: false
      }
    }),
    main: result => t.matchSnapshot(result),
  })
  t.end()
})

t.test('list that can also be false', t => {
  jack({
    foo: list({}),
    'no-foo': flag(),
    argv: ['--no-foo', '--foo=bar', '--no-foo', '--foo=baz', '--foo=blorg'],
    main: result => t.matchSnapshot(result),
  })
  t.end()
})

t.test('reparse', t => {
  const result = jack(options, ['--asdf', '-V'])
  t.matchSnapshot(result)
  t.matchSnapshot(result._.reparse('-v'), '-v')
  t.matchSnapshot(result._.reparse(['-V', '-X']), '-V -X')
  t.end()
})

t.test('update', t => {
  const result = jack(options, [])
  t.matchSnapshot(result)
  result._.update('--alias=bluerp')
  t.matchSnapshot(result, '--alias=bluerp')
  result._.update(['-V', '--no-xyz'])
  t.matchSnapshot(result, '-V --no-xyz')
  result._.update({ verbose: true })
  t.matchSnapshot(result, 'verbose: true')
  result._.update({ xyz: false })
  t.matchSnapshot(result, 'xyz: false')
  result._.update({ 'long-opt': null })
  t.matchSnapshot(result, 'long-opt: null')
  result._.update({ f: ['one', 'two'] })
  t.matchSnapshot(result, '-fone -ftwo')
  result._.update(null)
  t.matchSnapshot(result, 'null update has no effect')
  t.end()
})
