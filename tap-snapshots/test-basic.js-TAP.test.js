/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/basic.js TAP > empty 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > execPath and main file 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > imply some things 1`] = `
Object {
  "_": Array [],
  "verbose": 9,
  "xyz": true,
  "files": Array [
    "deadbeat",
    "folly",
    "frump",
    "lagamuffin",
  ],
  "implication": true,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > list using short arg, with and without = 1`] = `
Object {
  "_": Array [],
  "verbose": 4,
  "xyz": false,
  "files": Array [
    "one",
    "two",
  ],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > long opt alias 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "foo",
  ],
  "long-opt": "foo",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > must match snapshot 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "1",
    "2",
  ],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > negate some verbosity 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > parse only, using process.argv 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > positionals and some expansions 1`] = `
Object {
  "_": Array [
    "positional",
    "arg",
  ],
  "verbose": 2,
  "xyz": false,
  "files": Array [
    "foo",
    "bar",
  ],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > re-imply some things 1`] = `
Object {
  "_": Array [],
  "verbose": 9,
  "xyz": true,
  "files": Array [
    "deadbeat",
    "folly",
    "frump",
    "lagamuffin",
  ],
  "implication": true,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > short flag alias 1`] = `
Object {
  "_": Array [],
  "verbose": 3,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > un-imply some things 1`] = `
Object {
  "_": Array [],
  "verbose": 9,
  "xyz": false,
  "files": Array [
    "deadbeat",
    "folly",
    "frump",
    "lagamuffin",
  ],
  "implication": true,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP > using -- 1`] = `
Object {
  "_": Array [
    "-vv",
    "--file",
    "two",
  ],
  "verbose": 2,
  "xyz": false,
  "files": Array [
    "one",
  ],
  "implication": false,
  "long-list": Array [],
  "long-opt": "value",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP env things > must match snapshot 1`] = `
Object {
  "_": Array [],
  "implied": true,
  "unset": 7,
  "one": 1,
  "numbers": Array [],
  "counter": 2,
  "foo": "baz",
  "lines": Array [
    "a",
    "b",
    "c",
    "d",
  ],
  "nums": Array [
    1,
    2,
    3,
    4,
  ],
  "dreams": Array [],
  "flagon": true,
  "flagoff": false,
  "flagmaybe": false,
  "num1": 1,
  "num2": undefined,
  "implier": false,
  "help": false,
}
`

exports[`test/basic.js TAP list that can also be false > must match snapshot 1`] = `
Object {
  "_": Array [],
  "foo": Array [
    "baz",
    "blorg",
  ],
  "help": false,
}
`

exports[`test/basic.js TAP main fn > options in main fn 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP original, parsed, explicit > explicit 1`] = `
Set {
  "verbose",
  "xyz",
}
`

exports[`test/basic.js TAP original, parsed, explicit > original 1`] = `
Array [
  "-vaxv",
]
`

exports[`test/basic.js TAP original, parsed, explicit > parsed 1`] = `
Array [
  "--verbose",
  "--no-xyz",
  "--verbose",
  "--verbose",
  "--verbose",
  "--xyz",
  "--verbose",
]
`

exports[`test/basic.js TAP reparse > -V -X 1`] = `
Object {
  "_": Array [],
  "verbose": -1,
  "xyz": false,
}
`

exports[`test/basic.js TAP reparse > -v 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
}
`

exports[`test/basic.js TAP reparse > must match snapshot 1`] = `
Object {
  "_": Array [],
  "verbose": 2,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > --alias=bluerp 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > -V --no-xyz 1`] = `
Object {
  "_": Array [],
  "verbose": -1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > -fone -ftwo 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [
    "one",
    "two",
  ],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > must match snapshot 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > null update has no effect 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [
    "one",
    "two",
  ],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > verbose: true 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP update > xyz: false 1`] = `
Object {
  "_": Array [],
  "verbose": 1,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [
    "bluerp",
  ],
  "long-opt": "bluerp",
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP usage and help strings > must match snapshot 1`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`

exports[`test/basic.js TAP usage and help strings > must match snapshot 2`] = `
Object {
  "_": Array [],
  "verbose": 0,
  "xyz": false,
  "files": Array [],
  "implication": false,
  "long-list": Array [],
  "long-opt": undefined,
  "default-true": true,
  "noarg-flag": false,
  "help": false,
}
`
