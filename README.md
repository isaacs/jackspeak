# jackspeak

A very strict and proper argument parser.

(The name is a play on the pirate theme of "yargs".)

## USAGE

```js
const { jack, flag, opt, list, count } = require('jackspeak')

jack({
  // Optional
  // the function to call with the options argument when it's all done
  // if not provided, then jack() will return the parsed options
  // if any unknown options are passed in, then it'll abort with
  // the usage output and an error message
  main: myFunction,

  // Optional
  // defaults to process.argv, and slices off the first item if
  // it's process.execPath and the second item if it's
  // require.main.filename
  argv: process.argv,

  // Optional
  // This will be auto-generated from the descriptions if not supplied
  // top level usage line, printed by -h
  // will be auto-generated if not specified
  usage: 'foo [options] <files>',

  // Optional
  // longer-form help text
  // will be reformatted and wrapped to terminal column width,
  // so go ahead and format it however you like here.
  help: `
    Executes all the files and interprets their output as
    TAP formatted test result data.

    To parse TAP data from stdin, specify "-" as a filename.
  `

  // flags don't take a value, they're boolean on or off, and can be
  // turned off by prefixing with `--no-`
  // so this adds support for -b to mean --bail, or -B to mean --no-bail
  flag: flag({
    // specify a short value if you like.  this must be a single char
    short: 'f',
    // description is optional as well.
    description: `Make the flags wave`,
    // you can can always negate a flag with `--no-flag`
    // specifying a negate option will let you define a short
    // single-char option for negation.
    negate: {
      short: 'F',
      description: `Do not wave the flags`
    },
    // default value for flags is 'false', unless you change it
    default: true
  }),

  // Options that take a value are specified with `opt()`
  jobs: opt({
    short: 'j',
    description: 'number of jobs to run in parallel',
    default: 1
  }),

  // Aliases can be a flag or option that expands to
  // some other value when used.
  'jobs-auto': flag({
    short: 'J',
    alias: '--jobs=' + require('os').cpus().length
  }),

  // you can also set defaults with an environ of course
  timeout: opt({
    short: 't',
    default: +process.env.TAP_TIMEOUT || 30,
  }),

  // this makes --no-timeout equivalue to setting timeout to zero
  'no-timeout': flag({
    short: 'T',
    alias: '--timeout=0'
  }),

  // A list is an option that can be specified multiple times,
  // to expand into an array of all the settings.  Normal opts
  // will just give you the last value specified.
  'node-arg': list(),

  // A counter is a flag that increments or decrements its value
  // each time it's specified.
  // In this case, `-ddd` would return { debug: 3 } in the result
  debug: count({
    short: 'd'
  })

  // an alias can expand to multiple things, not just one
  foo: flag({
    alias: ['--statements=100', '--lines=100', '--branches=100'],
  }),

  // An option alias can take a value and use it in the expansion.
  // use `${value}` in the alias to sub in what the user provides
  covlevel: opt({
    alias: ['--statements=${value}', '--lines=${value}', '--branches=${value}]
  }),

  // aliases can recurse, as well
  100: flag({
    alias: '--covlevel=100'
  }),

  // opts take a value, and is set to the string in the results
  // you can combine multiple short-form flags together, but
  // an opt will end the combine chain, posix-style.  So,
  // -bofilename would be like --bail --output-file=filename
  'output-file': opt({
    short: 'o',
    // optional: make it -o<file> in the help output insead of -o<value>
    hint: 'file',
    description: `Send the raw output to the specified file.`
  }),
})
```
