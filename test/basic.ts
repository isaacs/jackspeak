import t from 'tap'
import { inspect } from 'util'
import { Jack, jack } from '../dist/esm/index.js'

t.beforeEach(t => {
  t.context.env = {}
  t.context.jack = jack({
    // Optional
    // This will be auto-generated from the descriptions if not supplied
    // top level usage line, printed by -h
    // will be auto-generated if not specified
    usage: 'foo [options] <files>',
    env: t.context.env,
    envPrefix: 'TEST',
  })
    .heading('The best Foo that ever Fooed')
    .description(
      ` Executes all the files and interprets their output as
        TAP formatted test result data.

        To parse TAP data from stdin, specify "-" as a filename.

        This is a list:

        - one
        - two
        - three
      `
    )
    .heading('Subcommands')
    .description(
      `several subcommands are available.

                  they are described below.`
    )
    .heading('bazzle', 3)
    .description('Bazzle the bedazzled razzle mafazzale')
    .heading('blorg', 3)
    .description(
      `When the grolb needs blorging, use this command
       and it will make sure every asdf is a quux.`
    )
    .description(
      ` A pre-formatted description section

     because
 '. \\   what if your usage banner
  '- \\                 needs a baby elephant
   / /_         .---.
  / | \\\\,.\\/--.//    )
  |  \\//        )/  / 
   \\  ' ^ ^    /    )____.----..  6
    '.____.    .___/            \\._) 
       .\\/.                      )
        '\\                       /
        _/ \\/    ).        )    (
       /#  .!    |        /\\    /
       \\  C// #  /'-----''/ #  / 
    .   'C/ |    |    |   |    |mrf  ,
    \\), .. .'OOO-'. ..'OOO'OOO-'. ..\\(,`,
      { pre: true }
    )

    .heading('Options', 2)
    .optList({
      'node-arg': {},
      'opts-array': {
        short: 'O',
        description: 'an array of opts',
        delim: ',',
        validate: (o: any): o is string[] =>
          Array.isArray(o) &&
          !o.some(s => typeof s !== 'string') &&
          !o.includes('asdf'),
      },
    })

    // flags don't take a value, they're boolean on or off, and can be
    // turned off by prefixing with `--no-`
    // so this adds support for -b to mean --bail, or -B to mean --no-bail
    .flag({
      flag: {
        // specify a short value if you like.  this must be a single char
        short: 'f',
        // description is optional as well.
        description: `Make the flags wave`,
        // default value for flags is 'false', unless you change it
        default: true,
      },
      'no-flag': {
        // you can can always negate a flag with `--no-flag`
        // specifying a negate option will let you define a short
        // single-char option for negation.
        short: 'F',
        description: `Do not wave the flags`,
      },
      onlytrue: {
        description: 'only allowed to be true',
        validate: (x: any) => x === true,
      },
    })

    // Options that take a value are specified with `opt()`
    .opt({
      reporter: {
        short: 'R',
        description: 'the style of report to display',
      },
      notfoo: {
        description: 'string that is not "foo"',
        validate: (s: any) => s !== 'foo',
      },
    })

    // if you want a number, say so, and jackspeak will enforce it
    .num({
      jobs: {
        short: 'j',
        description: 'how many jobs to run in parallel',
        default: 1,
      },
      ltfive: {
        short: '5',
        description: 'must be less than 5',
        validate: (n: any) => typeof n === 'number' && n < 5,
      },
    })

    .heading('Add Fields with jack.addFields()')
    .description(`This is helpful text. I'm helping! I'm helping youuuu`)

    .addFields({
      numlistaf: { type: 'number', multiple: true },
      flaglistaf: { type: 'boolean', multiple: true },
      optlistaf: { type: 'string', multiple: true },
      numaf: { type: 'number', multiple: false },
      flagaf: { type: 'boolean', multiple: false },
      optaf: { type: 'string', multiple: false },
    })

    .numList({
      gtthree: {
        short: '3',
        description: `This is long description with some helpful text.

          Note how it wraps and is indented. But in the output, it's
          normalized and only wraps as needed.



          That long break is normalized to one line break. One is enough,
          really.
        `,
        validate: (n: any) =>
          Array.isArray(n) &&
          !n.some(n => typeof n !== 'number' || n <= 3),
      },
      nums: {},
      defnums: { default: [1, 2, 3] },
    })

    .flagList({
      debug: { short: 'd' },
      alltrue: {
        validate: (a: any) => Array.isArray(a) && !a.some(v => v !== true),
      },
    })

    // opts take a value, and is set to the string in the results
    // you can combine multiple short-form flags together, but
    // an opt will end the combine chain, posix-style.  So,
    // -bofilename would be like --bail --output-file=filename
    .opt({
      'output-file': {
        short: 'o',
        // optional: make it -o<file> in the help output insead of -o<value>
        hint: 'file',
        description: `Send the raw output to the specified file.`,
      },
    })
})

t.test('inspection', t => {
  const { jack } = t.context as { jack: Jack }
  t.matchSnapshot(inspect(jack, { colors: false }), 'inspect')
  t.matchSnapshot(jack.toJSON())
  t.matchSnapshot(jack.usage())
  t.equal(jack.usage(), jack.usage(), 'returns same string again')
  t.matchSnapshot(jack.usageMarkdown())
  t.equal(
    jack.usageMarkdown(),
    jack.usageMarkdown(),
    'returns same string again'
  )
  t.end()
})

t.test('validate object', t => {
  const { jack } = t.context as { jack: Jack }
  t.matchSnapshot(jack.validate({ flag: true }), 'successful validate')
  t.throws(() => jack.validate({ debug: 12 }))
  t.throws(() => jack.validate({ flag: [true] }))
  t.throws(() => jack.validate({ 'opts-array': ['asdf'] }))
  t.throws(() => jack.validate({ 'opts-array': ['foo'], unknown: false }))
  t.throws(() => jack.validate(12))
  t.throws(() => jack.validate({ ltfive: 6 }))
  t.throws(() => jack.validate({ gtthree: 6 }))
  t.throws(() => jack.validate({ gtthree: [5, 4, 3, 2, 1] }))
  t.throws(() => jack.validate({ alltrue: [true, true, false, 1] }))
  t.throws(() => jack.validate({ onlytrue: false }))
  t.end()
})

t.test('invalid config defs', t => {
  const { jack } = t.context as { jack: Jack }
  t.throws(() => jack.num({ f: {} }))
  t.throws(() => jack.num({ flag: {} }))
  t.throws(() => jack.num({ fooooo: { short: 'f' } }))
  t.throws(() => jack.num({ fooooo: { short: 'foo' } }))
  t.throws(() => jack.num({ 'foo bar baz': {} }))
  //@ts-expect-error
  t.throws(() => jack.num({ xyz: { default: 'not a number' } }))
  //@ts-expect-error
  t.throws(() => jack.numList({ xyz: { default: 'not a number[]' } }))
  //@ts-expect-error
  t.throws(() => jack.opt({ xyz: { default: true } }))
  //@ts-expect-error
  t.throws(() => jack.optList({ xyz: { default: [true] } }))
  //@ts-expect-error
  t.throws(() => jack.flag({ xyz: { default: [true] } }))
  //@ts-expect-error
  t.throws(() => jack.flag({ xyz: { default: 'true' } }))
  //@ts-expect-error
  t.throws(() => jack.flag({ xyz: { hint: 'x' } }))
  //@ts-expect-error
  t.throws(() => jack.flagList({ xyz: { hint: 'x' } }))
  //@ts-expect-error
  t.throws(() => jack.flagList({ xyz: { default: ['x'] } }))
  t.end()
})

t.test('defaults to process.env and process.argv', t => {
  process.argv.push('--foo')
  delete process.env.JACKSPEAK_TEST_FOO
  t.equal(process.env.JACKSPEAK_TEST_FOO, undefined)
  const { positionals: posNoEval, values: valNoEval } = jack({
    envPrefix: 'JACKSPEAK_TEST',
  })
    .flag({
      foo: {},
    })
    .parse()
  t.equal(posNoEval.length, 0)
  t.matchSnapshot(valNoEval, 'default parse, no _eval')
  t.equal(process.env.JACKSPEAK_TEST_FOO, '1')
  delete process.env.JACKSPEAK_TEST_FOO

  Object.defineProperty(process, '_eval', {
    value: 'yolo',
    configurable: true,
  })
  const { positionals: posWithEval, values: valWithEval } = jack({
    envPrefix: 'JACKSPEAK_TEST',
  })
    .flag({
      foo: {},
    })
    .parse()
  t.matchSnapshot(valWithEval, 'default parse, with _eval')
  t.equal(posWithEval.length, 1)
  t.equal(process.env.JACKSPEAK_TEST_FOO, '1')
  delete process.env.JACKSPEAK_TEST_FOO
  process.argv.pop()
  t.end()
})

t.test('multiple is [] if env is empty', t => {
  const { jack, env } = t.context as {
    jack: Jack<{
      gtthree: { type: 'number'; multiple: true }
    }>
    env: Record<string, string>
  }
  env.TEST_GTTHREE = ''
  const { values } = jack.parse()
  t.strictSame(values.gtthree, [])
  t.end()
})

t.test('no env prefix, no writing env', t => {
  delete process.env.FOO
  const j = jack()
    .flag({ foo: { short: 'f' }, asdf: {} })
    .num({ bar: { short: 'b' }, baz: { hint: 'z' }, quux: {} })
  t.matchSnapshot(j.parse(['--foo']))
  t.matchSnapshot(j.usage(), 'usage without any heading or usage option')
  t.matchSnapshot(jack().flag({ foo: {} }).usage(), 'no short flags usage')
  t.matchSnapshot(
    j.usageMarkdown(),
    'usage markdown without any heading or usage option'
  )
  t.matchSnapshot(
    jack().flag({ foo: {} }).usageMarkdown(),
    'no short flags usage'
  )
  t.equal(process.env.FOO, undefined)
  t.end()
})

t.test('stop at positional', t => {
  const { values, positionals } = jack({
    stopAtPositional: true,
  })
    .num({ xyz: {} })
    .parse(['--xyz=1', 'positional', '--otherthing=x'])
  t.matchSnapshot({ values, positionals })
  t.end()
})

// [argv, env, invalid]
const cases: [a: string[], e?: { [k: string]: string }, inv?: boolean][] =
  [
    [['-O', 'foo', '-f', '-F', '--flag', '-ddd', '-j2']],
    [['-Oasdf', '-f', '-F', '--flag', '-ddd', '-j2'], {}, true],
    [['pos', '-j', '32'], { TEST_DEBUG: '1', TEST_FLAG: '0' }],
    [
      ['pos', '-F', 'itional', '-j', '32'],
      { TEST_JOBS: '123', TEST_FLAG: '1', TEST_REPORTER: 'reprep' },
    ],
    [['--nums', '1', '--nums', '2', '--gtthree', '4', '--node-arg=--x=y']],
    [['--unknownthing=yolo'], {}, true],
    [['--nums'], {}, true],
    [['--flag=wave'], {}, true],
    [['--jobs=workit'], {}, true],
    [
      [
        '--numlistaf=1',
        '--numlistaf=2',
        '--flaglistaf',
        '--no-flaglistaf',
        '--optlistaf=x',
        '--optlistaf=y',
        '--numaf=3',
        '--numaf=4',
        '--flagaf',
        '--no-flagaf',
        '--optaf=z',
        '--optaf=a',
      ],
    ],
  ]
for (const [args, e = {}, invalid] of cases) {
  t.test(args.join(' ') + ' ' + JSON.stringify(e), t => {
    const { jack, env } = t.context as {
      jack: Jack
      env: { [k: string]: string }
    }
    Object.assign(env, e)
    if (invalid) {
      t.matchSnapshot(
        t.throws(() => jack.parse(args)),
        'throw'
      )
    } else {
      t.matchSnapshot(jack.parse(args), 'parse results')
      t.matchSnapshot(env, 'env after parse')
    }
    t.end()
  })
}
