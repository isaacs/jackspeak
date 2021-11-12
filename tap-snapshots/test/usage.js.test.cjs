/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/usage.js TAP > a very long thing that does not wrap 1`] = `
Usage:
  usage.js <options>

  -the-short-form-is-shorter-but-not-short=<values-are-valuable>
  --this-is-a-very-long-option-name-dont-you-think?=<values-are-valuable>
             This option is hecka long.

             To make matters more complicated as well, it has a fairly long
             description as well. That means that the description will get
             bumped down a line, instead of the left hand side forcibly wrapping
             in ways that are sometimes awkward or weird.

             Most system CLI commands format their help text this way, and it's
             a tradition that has been with us for a very long time.

             Anyway, here's wonderwall...

  -h --help  Show this helpful output
  --no-help  switch off the --help flag

  --         Stop parsing flags and options, treat any additional command line
             arguments as positional arguments.

`

exports[`test/usage.js TAP > all kinds of helpful text 1`] = `
Usage:
  foo <bar> [baz options]

describeamabob:

  This text is very helpful.

  It has multiple paragraphs!

  --foo=<foo>  This is a helpful descripton of the foo option

               it is a  little spacey!

  -b --bar     how many bars are in a baz i wonder?
               Can be set multiple times

  --no-bar     decrement the --bar flag
               Can be set multiple times
  -l --line    this has

               many lines

               Can be set multiple times
  --no-line    decrement the --line flag
               Can be set multiple times
  -h --help    Show this helpful output
  --no-help    switch off the --help flag

  --           Stop parsing flags and options, treat any additional command line
               arguments as positional arguments.

`

exports[`test/usage.js TAP > help text 1`] = `
Usage:
  usage.js <options>

This text is very helpful.

It has multiple paragraphs!

  -h --help  Show this helpful output
  --no-help  switch off the --help flag

  --         Stop parsing flags and options, treat any additional command line
             arguments as positional arguments.

`

exports[`test/usage.js TAP > no options, null case 1`] = `
Usage:
  usage.js <options>

  -h --help  Show this helpful output
  --no-help  switch off the --help flag

  --         Stop parsing flags and options, treat any additional command line
             arguments as positional arguments.

`

exports[`test/usage.js TAP > usage text 1`] = `
Usage:
  foo <bar> [baz options]

  -? --help  show this thing you are reading now
  --         double every dash
`

exports[`test/usage.js TAP run without a main script > expected output 1`] = `
Usage:
  $0 <options>

  -f<foo> --foo=<foo>  some desc
  -h --help            Show this helpful output
  --no-help            switch off the --help flag

  --                   Stop parsing flags and options, treat any additional
                       command line arguments as positional arguments.


`

exports[`test/usage.js TAP usage multiple times does not recalculate > must match snapshot 1`] = `
Usage:
  usage.js <options>

  --foo      [no description provided]
  --no-foo   switch off the --foo flag

  this text is so helpful

  -h --help  Show this helpful output
  --no-help  switch off the --help flag

  --         Stop parsing flags and options, treat any additional command line
             arguments as positional arguments.

`
