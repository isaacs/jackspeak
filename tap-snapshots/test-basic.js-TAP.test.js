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
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > undefined 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  'long-list': [ '1', '2' ],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > positionals and some expansions 1`] = `
{ _: [ 'positional', 'arg' ],
  verbose: 2,
  xyz: false,
  files: [ 'foo', 'bar' ],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > execPath 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > execPath and main file 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > using process.argv 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > list using short arg, with and without = 1`] = `
{ _: [],
  verbose: 4,
  xyz: false,
  files: [ 'one', 'two' ],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > using -- 1`] = `
{ _: [ '-vv', '--file', 'two' ],
  verbose: 2,
  xyz: false,
  files: [ 'one' ],
  'long-list': [],
  'long-opt': 'value',
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > short flag alias 1`] = `
{ _: [],
  verbose: 3,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > long opt alias 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  'long-list': [ 'foo' ],
  'long-opt': 'foo',
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP > negate some verbosity 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP main fn > options in main fn 1`] = `
{ _: [],
  verbose: 1,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP usage and help strings > undefined 1`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`

exports[`test/basic.js TAP usage and help strings > undefined 2`] = `
{ _: [],
  verbose: 0,
  xyz: false,
  files: [],
  'long-list': [],
  'long-opt': undefined,
  'default-true': true,
  'noarg-flag': false }
`
