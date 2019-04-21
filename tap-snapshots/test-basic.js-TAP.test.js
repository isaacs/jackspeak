/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/basic.js TAP > empty 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > undefined 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [ '1', '2' ],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > positionals and some expansions 1`] = `
{ _: [ 'positional', 'arg' ],
  verbose: 2,
  xyz: false,
  files: [ 'foo', 'bar' ],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > execPath and main file 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > parse only, using process.argv 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > list using short arg, with and without = 1`] = `
{ _: [],
  verbose: 4,
  xyz: false,
  files: [ 'one', 'two' ],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > using -- 1`] = `
{ _: [ '-vv', '--file', 'two' ],
  verbose: 2,
  xyz: false,
  files: [ 'one' ],
  implication: false,
  'long-list': [],
  'long-opt': 'value',
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > short flag alias 1`] = `
{ _: [],
  verbose: 3,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > long opt alias 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [ 'foo' ],
  'long-opt': 'foo',
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > negate some verbosity 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > imply some things 1`] = `
{ _: [],
  verbose: 9,
  xyz: true,
  files: [ 'deadbeat', 'folly', 'frump', 'lagamuffin' ],
  implication: true,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > un-imply some things 1`] = `
{ _: [],
  verbose: 9,
  xyz: false,
  files: [ 'deadbeat', 'folly', 'frump', 'lagamuffin' ],
  implication: true,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP > re-imply some things 1`] = `
{ _: [],
  verbose: 9,
  xyz: true,
  files: [ 'deadbeat', 'folly', 'frump', 'lagamuffin' ],
  implication: true,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP main fn > options in main fn 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP usage and help strings > undefined 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP usage and help strings > undefined 2`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  implication: false,
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false,
  help: false }
`

exports[`test/basic.js TAP original, parsed, explicit > explicit 1`] = `
Set { 'verbose', 'xyz' }
`

exports[`test/basic.js TAP original, parsed, explicit > original 1`] = `
[ '-vaxv' ]
`

exports[`test/basic.js TAP original, parsed, explicit > parsed 1`] = `
[ '--verbose',
  '--no-xyz',
  '--verbose',
  '--verbose',
  '--verbose',
  '--xyz',
  '--verbose' ]
`

exports[`test/basic.js TAP env things > undefined 1`] = `
{ _: [],
  implied: true,
  unset: 7,
  one: 1,
  numbers: [],
  counter: 2,
  foo: 'baz',
  lines: [ 'a', 'b', 'c', 'd' ],
  nums: [ 1, 2, 3, 4 ],
  dreams: [],
  flagon: true,
  flagoff: false,
  flagmaybe: false,
  num1: 1,
  num2: undefined,
  implier: false,
  help: false }
`
