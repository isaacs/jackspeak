/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/usage.js TAP > no options, null case 1`] = `
Usage:
  usage.js <options>

`

exports[`test/usage.js TAP > help text 1`] = `
Usage:
  usage.js <options>

This text is very helpful.

It has multiple paragraphs!
`

exports[`test/usage.js TAP > usage text 1`] = `
Usage:
  foo <bar> [baz options]

`

exports[`test/usage.js TAP > all kinds of helpful text 1`] = `
Usage:
  foo <bar> [baz options]

This text is very helpful.

It has multiple paragraphs!

Options:

  --foo=[foo]  This is a helpful descripton of the foo option

               it is a  little spacey!

  --bar -b     how many bars are in a baz i wonder?
               Can be set multiple times

  --line -l    this has

               many lines

               Can be set multiple times

  --no-bar     [no description provided]
               Can be set multiple times

  --no-line    [no description provided]
               Can be set multiple times

`

exports[`test/usage.js TAP run without a main script > expected output 1`] = `
Usage:
  $0 <options>


Options:

  --foo=[foo] -f[foo]  some desc


`
