const t = require('tap')
const { list, jack, env, opt, flag, num, count } = require('../')
const assert = require('assert')
const test = (arg, msg) => t.throws(_ => jack(...arg), { message: msg }, msg)

test([{ main: 'foo' }], 'main must be function')
test([{ _: 'foo' }], '_ is reserved for positional arguments')
test([{ usage: {} }], 'usage must be a string or array')
test([{ help: {} }], 'help must be a string')
test([{ foo: {} }], 'foo not flag, opt, or env')
test([{ 'no-x': flag(), x: flag() }], `'x' specified, but 'no-x' already defined`)
test([{xy: flag({ short:'x'}), xx: flag({short: 'x'}) }],
     `x defined multiple times`)
test([{ argv: ['--foo'] }], 'invalid argument: --foo')
test([{ xyz: flag({short:'x'}), argv: ['-xy']}], 'invalid argument: -y')
test([{ xyz: flag(), argv: ['--xyz=foo']}], 'value provided for boolean flag: xyz')
test([{ xyz: opt(), argv: ['--xyz']}], 'no value provided for option: xyz')
test([['a','b','c'], ['x','y','z']], 'argv specified multiple times')
test([{ al: opt({alias:'--foo=${value}'}), foo: opt(), argv:['--al']}],
     'no value provided for option: al')
test([{ ho: flag({short: 'h'}) }], `ho using 'h' short val, reserved for --help`)
test([{ e: env('e') }, { env: {e:'asdf'} }], `env specified multiple times
(did you set it after defining some environment args?)`)
test([{ description: true }], 'description must be string')
test([{e:flag()},{e:env()}], 'e defined multiple times')
test([{e:env(list({}))}], 'env list e lacks delimiter')
test([{env: { e: 'asdf' }, e:env(flag({}))}],
     'Environment variable e must be set to 0 or 1 only')
test([{env: { e: 'asdf' }, e:num(env())}],
     `non-number 'asdf' given for numeric environment variable e`)
test([{main:console.log},{main:console.log}],
     'main function specified multiple times')
test([{argv:['--x=y'],x:num()}],
     `non-number 'y' given for numeric arg --x`)
test([{argv:['--x=5'],x:num({max:2})}],
     'value 5 for arg --x exceeds max (2)')
test([{argv:['--x=2'],x:num({min:5})}],
     'value 2 for arg --x below min (5)')
test([{env:{x:'2'}},{x:env(num({min:5}))}],
     'value 2 for environment variable x below min (5)')
test([{argv:['--x=y'],x:opt({valid:['a','b','c']})}],
`Invalid value y provided for x.
    Must be one of:
        a b c`)
