import t from 'tap'
import { jack, JackOptions } from '../dist/esm/index.js'

const newJack = (opts: JackOptions = {}) =>
  jack(opts)
    .flag({ bool: {} })
    .flagList({ bools: {} })
    .opt({ str: {} })
    .optList({ strs: {} })
    .num({ num: {} })
    .numList({ nums: {} })

t.test('set some config data', t => {
  const j = newJack()
  j.setConfigValues({
    bool: true,
    bools: [true, false, true],
    str: 'hello',
    strs: ['a', 'b'],
    num: 123,
    nums: [1, 2, 3],
  })
  t.strictSame(j.parse().values, {
    bool: true,
    bools: [true, false, true],
    str: 'hello',
    strs: ['a', 'b'],
    num: 123,
    nums: [1, 2, 3],
  })
  t.end()
})

t.test('env and cli override config data', t => {
  const j = newJack({
    envPrefix: 'J',
    env: {
      J_BOOL: '0',
      J_BOOLS: '0\n1\n0',
    },
  }).setConfigValues({
    bool: true,
    bools: [true, false, true],
    str: 'hello',
    strs: ['a', 'b'],
    num: 123,
    nums: [1, 2, 3],
  })
  t.strictSame(j.parse(['--str=world']).values, {
    bool: false,
    bools: [false, true, false],
    str: 'world',
    strs: ['a', 'b'],
    num: 123,
    nums: [1, 2, 3],
  })
  t.end()
})

t.test('env and cli override config data', t => {
  const j = newJack()
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ foo: 'unknown' }), {
    source: undefined,
    message: 'Unknown config option: foo',
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ num: 'unknown' }), {
    source: undefined,
    message: `Invalid value string for num, expected number`,
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ strs: true }), {
    source: undefined,
    message: `Invalid value boolean for strs, expected string[]`,
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', 'b'] }), {
    source: undefined,
    message: 'Invalid value string[] for bools, expected boolean[]',
    field: 'bools',
    value: ['a', 'b'],
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', true] }), {
    source: undefined,
    message:
      'Invalid value (string|boolean)[] for bools, expected boolean[]',
    field: 'bools',
    value: ['a', true],
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', true] }, 'blah.rc'), {
    source: 'blah.rc',
    message:
      'Invalid value (string|boolean)[] for bools, expected boolean[]',
    field: 'bools',
    value: ['a', true],
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bool: 1 }, 'blah.rc'), {
    source: 'blah.rc',
    message: 'Invalid value number for bool, expected boolean',
    field: 'bool',
    value: 1,
  })
  t.end()
})
