const t = require('tap')
const { jack, opt, flag, count, list } = require('../')
const test = (options, desc) => {
  const consoleLog = console.log
  console.log = msg => t.matchSnapshot(msg, desc)
  jack({ argv: ['--help'], ...options })
  console.log = consoleLog
}

test({}, 'no options, null case')
test({
  help: 'This text is very helpful.\n\nIt has multiple paragraphs!',
  argv: ['-h']
}, 'help text')
test({
  usage: 'foo <bar> [baz options]',
  help: flag({
    short: '?',
    description: 'show this thing you are reading now',
    negate: { hidden: true },
  }),
  argv: ['-?'],
  '--': flag({ description: 'double every dash' }),
}, 'usage text')
test({
  description: 'describeamabob',
  help: 'This text is very helpful.\n\nIt has multiple paragraphs!',
  usage: 'foo <bar> [baz options]',
  foo: opt({
    description: 'This is a helpful descripton of the foo option' +
      '\n\n\n\n it   is   a   little   spacey!     ',
    default: 99
  }),
  bar: count({
    short: 'b',
    description: 'how many bars are in a baz i wonder?'
  }),
  line: count({
    short:'l',
    description: 'this has\n\nmany lines'
  }),
  argv: [ '--help', '-h' ]
}, 'all kinds of helpful text')

test({
  'this-is-a-very-long-option-name-dont-you-think?': opt({
    short: 'the-short-form-is-shorter-but-not-short',
    hint: 'values-are-valuable',
    description: `
      This option is hecka long.

      To make matters more complicated as well, it has
      a fairly long description as well.  That means that the description
      will get bumped down a line, instead of the left hand side
      forcibly wrapping in ways that are sometimes awkward or weird.

      Most system CLI commands format their help text this way, and it's
      a tradition that has been with us for a very long time.

      Anyway, here's wonderwall...`
  })
}, 'a very long thing that does not wrap')

t.test('usage multiple times does not recalculate', t => {
  const consolelog = console.log
  const logs = []
  console.log = msg => logs.push(msg)
  t.teardown(() => console.log = consolelog)
  const r = jack({ foo: flag() }, { help: 'this text is so helpful' })
  r._.usage()
  t.matchSnapshot(logs[0])
  r._.usage()
  t.equal(logs.length, 2)
  t.equal(logs[0], logs[1])
  t.end()
})

t.test('run without a main script', t => {
  const out = []
  const err = []
  const child = require('child_process').spawn(
    process.execPath,
    ['-e', `
      const j = require(${JSON.stringify(require.resolve('../'))})
      j.jack({
        foo: j.opt({
          short: 'f',
          description: 'some desc'
        }),
        argv: ['-h']
      })
    `]
  )
  child.stdout.on('data', c => out.push(c+''))
  child.stderr.on('data', c => err.push(c+''))
  child.on('close', (code, sig) => {
    if (code)
      console.error(out, err)

    t.notOk(code, 'code=' + JSON.stringify(code))
    t.notOk(sig)
    t.matchSnapshot(out.join(''), 'expected output')
    t.end()
  })
})
