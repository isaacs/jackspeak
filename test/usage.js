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
  argv: ['-?']
}, 'usage text')
test({
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
  argv: [ '--help', '-?' ]
}, 'all kinds of helpful text')

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
