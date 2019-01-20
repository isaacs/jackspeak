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

  --help, -h  Show this helpful output

  --no-help   switch off the --help flag

  --          Stop parsing flags and options, treat any additional command line
              arguments as positional arguments.

`

exports[`test/usage.js TAP > help text 1`] = `
Usage:
  usage.js <options>

This text is very helpful.

It has multiple paragraphs!

  --help, -h  Show this helpful output

  --no-help   switch off the --help flag

  --          Stop parsing flags and options, treat any additional command line
              arguments as positional arguments.

`

exports[`test/usage.js TAP > usage text 1`] = `
Usage:
  foo <bar> [baz options]

  --help, -?  show this thing you are reading now

  --          double every dash

`

exports[`test/usage.js TAP > all kinds of helpful text 1`] = `
Usage:
  foo <bar> [baz options]

describeamabob:

This text is very helpful.

It has multiple paragraphs!

  --foo=<foo>  This is a helpful descripton of the foo option

               it is a  little spacey!

  --bar, -b    how many bars are in a baz i wonder?
               Can be set multiple times

  --no-bar     decrement the --bar flag
               Can be set multiple times

  --line, -l   this has

               many lines

               Can be set multiple times

  --no-line    decrement the --line flag
               Can be set multiple times

  --help, -h   Show this helpful output

  --no-help    switch off the --help flag

  --           Stop parsing flags and options, treat any additional command line
               arguments as positional arguments.

`

exports[`test/usage.js TAP usage multiple times does not recalculate > undefined 1`] = `
Usage:
  usage.js <options>

  --foo       [no description provided]

  --no-foo    switch off the --foo flag

this text is so helpful

  --help, -h  Show this helpful output

  --no-help   switch off the --help flag

  --          Stop parsing flags and options, treat any additional command line
              arguments as positional arguments.

`

exports[`test/usage.js TAP run without a main script > expected output 1`] = `
Usage:
  $0 <options>

  --foo=<foo>, -f<foo>  some desc

  --help, -h            Show this helpful output

  --no-help             switch off the --help flag

  --                    Stop parsing flags and options, treat any additional
                        command line arguments as positional arguments.


`
