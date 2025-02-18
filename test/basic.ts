import t from 'tap'
import { inspect } from 'util'
import { isConfigOption, Jack, jack } from '../src/index.js'

const context = ({ env = {} } = {}) => ({
  env,
  jack: jack({
    // Optional
    // This will be auto-generated from the descriptions if not supplied
    // top level usage line, printed by -h
    // will be auto-generated if not specified
    usage: 'foo [options] <files>',
    env,
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
      `,
    )
    .heading('Subcommands')
    .description(
      `several subcommands are available.

                  they are described below.`,
    )
    .heading('bazzle', 3)
    .description('Bazzle the bedazzled razzle mafazzale')
    .heading('blorg', 3)
    .description(
      `When the grolb needs blorging, use this command
       and it will make sure every asdf is a quux.`,
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
      { pre: true },
    )

    .heading('Options', 2)
    .optList({
      'node-arg': {},
      'opts-array': {
        short: 'O',
        description: 'an array of opts',
        delim: ',',
        validate: (o): o is string[] =>
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
        validate: x => x === true,
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
        validate: s => s !== 'foo',
      },
      // force it to be set to a subset with validOptions
      oneof: {
        description: 'one of the following',
        validOptions: ['a', 'b', 'cant-not-be-see'],
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
        validate: n => typeof n === 'number' && n < 5,
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
        validate: n =>
          Array.isArray(n) &&
          !n.some(n => typeof n !== 'number' || n <= 3),
      },
      nums: {},
      defnums: { default: [1, 2, 3] },
    })

    .flagList({
      debug: { short: 'd' },
      alltrue: {
        validate: a => Array.isArray(a) && !a.some(v => v !== true),
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
    }),
})

t.test('inspection', t => {
  const { jack } = context()
  t.matchSnapshot(inspect(jack, { colors: false }), 'inspect')
  t.matchSnapshot(jack.toJSON())
  t.matchSnapshot(jack.usage())
  t.equal(jack.usage(), jack.usage(), 'returns same string again')
  t.matchSnapshot(jack.usageMarkdown())
  t.equal(
    jack.usageMarkdown(),
    jack.usageMarkdown(),
    'returns same string again',
  )
  t.end()
})

t.test('validate object', t => {
  const { jack } = context()
  t.doesNotThrow(() => jack.validate({ flag: true }))
  t.throws(() => jack.validate({ debug: 12 }))
  t.throws(() => jack.validate({ flag: [true] }))
  t.throws(() => jack.validate({ 'opts-array': ['asdf'] }), {
    message: 'Invalid config value for opts-array: ["asdf"]',
  })
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
  const { jack } = context()
  t.throws(() => jack.num({ f: {} }))
  t.throws(() => jack.num({ flag: {} }), {
    message: 'Cannot redefine option flag',
  })
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
  const { jack, env } = context() as {
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
    'usage markdown without any heading or usage option',
  )
  t.matchSnapshot(
    jack().flag({ foo: {} }).usageMarkdown(),
    'no short flags usage',
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
  t.throws(() =>
    jack({
      stopAtPositional: true,
    })
      .num({
        xyz: {
          validate: n => n === 1,
        },
      })
      .parse(['--xyz=2', 'positional', '--otherthing=x']),
  )
  t.end()
})

t.test('stop at positional test', t => {
  const { values, positionals } = jack({
    stopAtPositionalTest: s => s === 'stop',
  })
    .num({ xyz: {} })
    .parse(['--xyz=1', 'positional', '--xyz=2', 'stop', '--otherthing=x'])
  t.strictSame(values, { xyz: 2 })
  t.strictSame(positionals, ['positional', 'stop', '--otherthing=x'])
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
    [['--unknownthing'], {}, true],
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
    const { jack, env } = context()
    Object.assign(env, e)
    if (invalid) {
      t.matchSnapshot(
        t.throws(() => jack.parse(args)),
        'throw',
      )
    } else {
      t.matchSnapshot(jack.parse(args), 'parse results')
      t.matchSnapshot(env, 'env after parse')
    }
    t.end()
  })
}

t.test('validate against options', t => {
  const j = jack()
    .addFields({
      'vo-opt': {
        type: 'string',
        validOptions: ['x', 'y'] as const,
      },
      'vo-optlist': {
        type: 'string',
        multiple: true,
        validOptions: ['x', 'y'] as const,
      },
      'vo-num': {
        type: 'number',
        validOptions: [1, 2] as const,
      },
      'vo-numlist': {
        type: 'number',
        multiple: true,
        validOptions: [1, 2] as const,
      },
    })
    .opt({
      'vo-by-opt': {
        validOptions: ['x', 'y'] as const,
      },
    })
    .optList({
      'vo-by-optlist': {
        validOptions: ['x', 'y'] as const,
      },
    })
    .num({
      'vo-by-num': {
        validOptions: [1, 2] as const,
      },
    })
    .numList({
      'vo-by-numlist': {
        validOptions: [1, 2] as const,
      },
    })
  t.throws(() => j.validate({ 'vo-opt': 'a' }))
  t.throws(() => j.validate({ 'vo-optlist': ['a'] }))
  t.throws(() => j.validate({ 'vo-num': 9 }))
  t.throws(() => j.validate({ 'vo-numlist': [9] }))
  t.throws(() => j.validate({ 'vo-by-opt': 'a' }))
  t.throws(() => j.validate({ 'vo-by-optlist': ['a'] }))
  t.throws(() => j.validate({ 'vo-by-num': 9 }))
  t.throws(() => j.validate({ 'vo-by-numlist': [9] }))
  t.doesNotThrow(() =>
    j.validate({
      'vo-opt': 'x',
      'vo-optlist': ['y'],
      'vo-num': 1,
      'vo-numlist': [2],
      'vo-by-opt': 'x',
      'vo-by-optlist': ['y'],
      'vo-by-num': 1,
      'vo-by-numlist': [2],
    }),
  )

  // invalid validOptions
  //@ts-expect-error
  t.throws(() => j.num({ n: { validOptions: ['x'] } }))
  //@ts-expect-error
  t.throws(() => j.numList({ n: { validOptions: ['x'] } }))
  //@ts-expect-error
  t.throws(() => j.opt({ n: { validOptions: [1] } }))
  //@ts-expect-error
  t.throws(() => j.optList({ n: { validOptions: [1] } }))

  t.equal(
    isConfigOption(
      {
        type: 'string',
        multiple: true,
        validOptions: ['hello'],
      },
      'string',
      true,
    ),
    true,
  )

  t.equal(
    isConfigOption(
      {
        type: 'string',
        multiple: true,
        validOptions: [1],
      },
      'string',
      true,
    ),
    false,
  )

  t.equal(
    isConfigOption(
      {
        type: 'boolean',
        validOptions: [true],
      },
      'boolean',
      false,
    ),
    false,
    'flags cannot have validOptions',
  )

  t.throws(() => j.parse(['--vo-opt=a']), {
    cause: {
      name: 'vo-opt',
      found: 'a',
      validOptions: ['x', 'y'],
    },
  })

  const v = j.parse([]).values
  //@ts-expect-error
  v['vo-opt'] = 'a'

  t.matchSnapshot(j.usage())
  t.end()
})

t.test('parseRaw', t => {
  t.intercept(process, 'env', { value: { FOO_XYZ: '123' } })
  const j = jack({
    envPrefix: 'FOO',
  }).num({
    xyz: {
      default: 345,
      validate: (n: unknown) => Number(n) % 2 === 1,
    },
  })
  const p = j.parseRaw(['--xyz=235'])
  t.equal(p.values.xyz, 235)
  t.throws(() => j.parseRaw(['--xyz=12']))
  t.throws(() => j.parseRaw(['--xyz=hello']))
  t.equal(j.parseRaw([]).values.xyz, undefined)
  t.equal(process.env.FOO_XYZ, '123', 'env not modified')
  t.end()
})

t.test('description with fenced code blocks', t => {
  const j = jack({}).num({
    xyz: {
      description: `Sometimes, there's a number and you care about
                      doing something special with that number, like

                      \`\`\`
                      console.log(
                        heloo, number


                        such a fine day we're having,isn't it?

                      Ok, goodbye then.
                      )
                      \`\`\`

                      this is some stuff that happens later

                      \`\`\`
                      just one line, no indentation
                      \`\`\`

                      nothing in this one:
                      \`\`\`
        \`\`\`
                      `,
    },
  })
  t.matchSnapshot(j.usage())
  t.end()
})
