const t = require('tap')
const { list, jack, env, opt, flag } = require('../')
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
test([{env: { e: 'asdf' }, e:env({type: 'number'})}],
     'Non-numeric value asdf provided for environment variable e')
test([{main:console.log},{main:console.log}],
     'main function specified multiple times')
test([{argv:['--x=y'],x:opt({type:'number'})}],
     'non-number given for numeric arg --x')
test([{argv:['--x=5'],x:opt({type:'number',max:2})}],
     'value 5 for --x exceeds max (2)')
test([{argv:['--x=2'],x:opt({type:'number',min:5})}],
     'value 2 for --x below min (5)')
