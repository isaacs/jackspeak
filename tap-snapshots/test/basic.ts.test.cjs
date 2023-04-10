/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/basic.ts --foo TAP defaults to process.env and process.argv > default parse, no _eval 1`] = `
Object {
  "foo": true,
}
`

exports[`test/basic.ts --foo TAP defaults to process.env and process.argv > default parse, with _eval 1`] = `
Object {
  "foo": true,
}
`

exports[`test/basic.ts TAP --flag=wave {} > throw 1`] = `
Error: Flag --flag does not take a value, received 'wave' {
  "name": "Error",
}
`

exports[`test/basic.ts TAP --jobs=workit {} > throw 1`] = `
Error: Invalid value 'workit' provided for '--jobs' option, expected number {
  "name": "Error",
}
`

exports[`test/basic.ts TAP --numlistaf=1 --numlistaf=2 --flaglistaf --no-flaglistaf --optlistaf=x --optlistaf=y --numaf=3 --numaf=4 --flagaf --no-flagaf --optaf=z --optaf=a {} > env after parse 1`] = `
Object {
  "TEST_DEFNUMS": String(
    1
    2
    3
  ),
  "TEST_FLAG": "1",
  "TEST_FLAGAF": "0",
  "TEST_FLAGLISTAF": String(
    1
    0
  ),
  "TEST_JOBS": "1",
  "TEST_NUMAF": "4",
  "TEST_NUMLISTAF": String(
    1
    2
  ),
  "TEST_OPTAF": "a",
  "TEST_OPTLISTAF": String(
    x
    y
  ),
}
`

exports[`test/basic.ts TAP --numlistaf=1 --numlistaf=2 --flaglistaf --no-flaglistaf --optlistaf=x --optlistaf=y --numaf=3 --numaf=4 --flagaf --no-flagaf --optaf=z --optaf=a {} > parse results 1`] = `
Object {
  "positionals": Array [],
  "values": Object {
    "defnums": Array [
      1,
      2,
      3,
    ],
    "flag": true,
    "flagaf": false,
    "flaglistaf": Array [
      true,
      false,
    ],
    "jobs": 1,
    "numaf": 4,
    "numlistaf": Array [
      1,
      2,
    ],
    "optaf": "a",
    "optlistaf": Array [
      "x",
      "y",
    ],
  },
}
`

exports[`test/basic.ts TAP --nums 1 --nums 2 --gtthree 4 --node-arg=--x=y {} > env after parse 1`] = `
Object {
  "TEST_DEFNUMS": String(
    1
    2
    3
  ),
  "TEST_FLAG": "1",
  "TEST_GTTHREE": "4",
  "TEST_JOBS": "1",
  "TEST_NODE_ARG": "--x=y",
  "TEST_NUMS": String(
    1
    2
  ),
}
`

exports[`test/basic.ts TAP --nums 1 --nums 2 --gtthree 4 --node-arg=--x=y {} > parse results 1`] = `
Object {
  "positionals": Array [],
  "values": Object {
    "defnums": Array [
      1,
      2,
      3,
    ],
    "flag": true,
    "gtthree": Array [
      4,
    ],
    "jobs": 1,
    "node-arg": Array [
      "--x=y",
    ],
    "nums": Array [
      1,
      2,
    ],
  },
}
`

exports[`test/basic.ts TAP --nums {} > throw 1`] = `
Error: No value provided for --nums, expected number {
  "name": "Error",
}
`

exports[`test/basic.ts TAP --unknownthing=yolo {} > throw 1`] = `
Error: Unknown option '--unknownthing'. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- --unknownthing' {
  "name": "Error",
}
`

exports[`test/basic.ts TAP -O foo -f -F --flag -ddd -j2 {} > env after parse 1`] = `
Object {
  "TEST_DEBUG": String(
    1
    1
    1
  ),
  "TEST_DEFNUMS": String(
    1
    2
    3
  ),
  "TEST_FLAG": "1",
  "TEST_JOBS": "2",
  "TEST_OPTS_ARRAY": "foo",
}
`

exports[`test/basic.ts TAP -O foo -f -F --flag -ddd -j2 {} > parse results 1`] = `
Object {
  "positionals": Array [],
  "values": Object {
    "debug": Array [
      true,
      true,
      true,
    ],
    "defnums": Array [
      1,
      2,
      3,
    ],
    "flag": true,
    "jobs": 2,
    "opts-array": Array [
      "foo",
    ],
  },
}
`

exports[`test/basic.ts TAP -Oasdf -f -F --flag -ddd -j2 {} > throw 1`] = `
Error: Invalid value provided for --opts-array: ["asdf"] {
  "name": "Error",
}
`

exports[`test/basic.ts TAP inspection > inspect 1`] = `
Jack {
  'node-arg': { type: 'string', multiple: true },
  'opts-array': {
    type: 'string',
    multiple: true,
    delim: ',',
    short: 'O',
    description: 'an array of opts',
    validate: [Function: validate]
  },
  flag: {
    type: 'boolean',
    short: 'f',
    description: 'Make the flags wave',
    default: true
  },
  'no-flag': { type: 'boolean', short: 'F', description: 'Do not wave the flags' },
  onlytrue: {
    type: 'boolean',
    description: 'only allowed to be true',
    validate: [Function: validate]
  },
  reporter: {
    type: 'string',
    short: 'R',
    description: 'the style of report to display'
  },
  notfoo: {
    type: 'string',
    description: 'string that is not "foo"',
    validate: [Function: validate]
  },
  jobs: {
    type: 'number',
    short: 'j',
    description: 'how many jobs to run in parallel',
    default: 1
  },
  ltfive: {
    type: 'number',
    short: '5',
    description: 'must be less than 5',
    validate: [Function: validate]
  },
  numlistaf: { type: 'number', multiple: true },
  flaglistaf: { type: 'boolean', multiple: true },
  optlistaf: { type: 'string', multiple: true },
  numaf: { type: 'number' },
  flagaf: { type: 'boolean' },
  optaf: { type: 'string' },
  gtthree: {
    type: 'number',
    multiple: true,
    short: '3',
    description: 'This is long description with some helpful text.\\n' +
      '\\n' +
      "          Note how it wraps and is indented. But in the output, it's\\n" +
      '          normalized and only wraps as needed.\\n' +
      '\\n' +
      '\\n' +
      '\\n' +
      '          That long break is normalized to one line break. One is enough,\\n' +
      '          really.\\n' +
      '        ',
    validate: [Function: validate]
  },
  nums: { type: 'number', multiple: true },
  defnums: { type: 'number', multiple: true, default: [ 1, 2, 3 ] },
  debug: { type: 'boolean', multiple: true, short: 'd' },
  alltrue: { type: 'boolean', multiple: true, validate: [Function: validate] },
  'output-file': {
    type: 'string',
    short: 'o',
    description: 'Send the raw output to the specified file.'
  }
}
`

exports[`test/basic.ts TAP inspection > must match snapshot 1`] = `
Object {
  "alltrue": Object {
    "multiple": true,
    "type": "boolean",
    "validate": Function validate(a),
  },
  "debug": Object {
    "multiple": true,
    "short": "d",
    "type": "boolean",
  },
  "defnums": Object {
    "default": Array [
      1,
      2,
      3,
    ],
    "multiple": true,
    "type": "number",
  },
  "flag": Object {
    "default": true,
    "description": "Make the flags wave",
    "short": "f",
    "type": "boolean",
  },
  "flagaf": Object {
    "type": "boolean",
  },
  "flaglistaf": Object {
    "multiple": true,
    "type": "boolean",
  },
  "gtthree": Object {
    "description": String(
      This is long description with some helpful text.
      
                Note how it wraps and is indented. But in the output, it's
                normalized and only wraps as needed.
      
      
      
                That long break is normalized to one line break. One is enough,
                really.
              
    ),
    "multiple": true,
    "short": "3",
    "type": "number",
    "validate": Function validate(n),
  },
  "jobs": Object {
    "default": 1,
    "description": "how many jobs to run in parallel",
    "short": "j",
    "type": "number",
  },
  "ltfive": Object {
    "description": "must be less than 5",
    "short": "5",
    "type": "number",
    "validate": Function validate(n),
  },
  "no-flag": Object {
    "description": "Do not wave the flags",
    "short": "F",
    "type": "boolean",
  },
  "node-arg": Object {
    "multiple": true,
    "type": "string",
  },
  "notfoo": Object {
    "description": "string that is not \\"foo\\"",
    "type": "string",
    "validate": Function validate(s),
  },
  "numaf": Object {
    "type": "number",
  },
  "numlistaf": Object {
    "multiple": true,
    "type": "number",
  },
  "nums": Object {
    "multiple": true,
    "type": "number",
  },
  "onlytrue": Object {
    "description": "only allowed to be true",
    "type": "boolean",
    "validate": Function validate(x),
  },
  "optaf": Object {
    "type": "string",
  },
  "optlistaf": Object {
    "multiple": true,
    "type": "string",
  },
  "opts-array": Object {
    "delim": ",",
    "description": "an array of opts",
    "multiple": true,
    "short": "O",
    "type": "string",
    "validate": Function validate(o),
  },
  "output-file": Object {
    "description": "Send the raw output to the specified file.",
    "short": "o",
    "type": "string",
  },
  "reporter": Object {
    "description": "the style of report to display",
    "short": "R",
    "type": "string",
  },
}
`

exports[`test/basic.ts TAP inspection > must match snapshot 2`] = `
The best Foo that ever Fooed
Usage:
  foo [options] <files>

Executes all the files and interprets their output as TAP formatted test result
data.

To parse TAP data from stdin, specify "-" as a filename.

  --node-arg=<node-arg>  Can be set multiple times

  -O<opts-array> --opts-array=<opts-array>
                         an array of opts Can be set multiple times
  -f --flag              Make the flags wave
  -F --no-flag           Do not wave the flags
  --onlytrue             only allowed to be true

  -R<reporter> --reporter=<reporter>
                         the style of report to display
  --notfoo=<notfoo>      string that is not "foo"
  -j<n> --jobs=<n>       how many jobs to run in parallel
  -5<n> --ltfive=<n>     must be less than 5

Add Fields with jack.addFields()


  This is helpful text. I'm helping! I'm helping youuuu


  --numlistaf=<n>        Can be set multiple times
  --flaglistaf           Can be set multiple times
  --optlistaf=<optlistaf Can be set multiple times
  >
  --numaf=<n>
  --flagaf
  --optaf=<optaf>
  -3<n> --gtthree=<n>    This is long description with some helpful text.

                         Note how it wraps and is indented. But in the output,
                         it's normalized and only wraps as needed.

                         That long break is normalized to one line break. One is
                         enough, really.

                         Can be set multiple times

  --nums=<n>             Can be set multiple times
  --defnums=<n>          Can be set multiple times
  -d --debug             Can be set multiple times
  --alltrue              Can be set multiple times

  -o<file> --output-file=<file>
                         Send the raw output to the specified file.
`

exports[`test/basic.ts TAP no env prefix, no writing env > must match snapshot 1`] = `
Object {
  "positionals": Array [],
  "values": Object {
    "foo": true,
  },
}
`

exports[`test/basic.ts TAP no env prefix, no writing env > no short flags usage 1`] = `
Usage:
  basic.ts --foo

  --foo
`

exports[`test/basic.ts TAP no env prefix, no writing env > usage without any heading or usage option 1`] = `
Usage:
  basic.ts -f --b=<bar> --asdf --baz=<z> --quux=<quux>

  -f --foo
  --asdf
  -b<n> --bar=<n>
  --baz=<z>
  --quux=<n>
`

exports[`test/basic.ts TAP pos -F itional -j 32 {"TEST_JOBS":"123","TEST_FLAG":"1","TEST_REPORTER":"reprep"} > env after parse 1`] = `
Object {
  "TEST_DEFNUMS": String(
    1
    2
    3
  ),
  "TEST_FLAG": "0",
  "TEST_JOBS": "32",
  "TEST_REPORTER": "reprep",
}
`

exports[`test/basic.ts TAP pos -F itional -j 32 {"TEST_JOBS":"123","TEST_FLAG":"1","TEST_REPORTER":"reprep"} > parse results 1`] = `
Object {
  "positionals": Array [
    "pos",
    "itional",
  ],
  "values": Object {
    "defnums": Array [
      1,
      2,
      3,
    ],
    "flag": false,
    "jobs": 32,
    "reporter": "reprep",
  },
}
`

exports[`test/basic.ts TAP pos -j 32 {"TEST_DEBUG":"1","TEST_FLAG":"0"} > env after parse 1`] = `
Object {
  "TEST_DEBUG": "1",
  "TEST_DEFNUMS": String(
    1
    2
    3
  ),
  "TEST_FLAG": "0",
  "TEST_JOBS": "32",
}
`

exports[`test/basic.ts TAP pos -j 32 {"TEST_DEBUG":"1","TEST_FLAG":"0"} > parse results 1`] = `
Object {
  "positionals": Array [
    "pos",
  ],
  "values": Object {
    "debug": Array [
      true,
    ],
    "defnums": Array [
      1,
      2,
      3,
    ],
    "flag": false,
    "jobs": 32,
  },
}
`

exports[`test/basic.ts TAP stop at positional > must match snapshot 1`] = `
Object {
  "positionals": Array [
    "positional",
    "--otherthing=x",
  ],
  "values": Object {
    "xyz": 1,
  },
}
`

exports[`test/basic.ts TAP validate object > successful validate 1`] = `
undefined
`