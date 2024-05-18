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
    message: 'Unknown config option: foo',
    cause: { source: undefined },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ num: 'unknown' }), {
    message: `Invalid value string for num, expected number`,
    cause: { source: undefined },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ strs: true }), {
    message: `Invalid value boolean for strs, expected string[]`,
    cause: { source: undefined },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', 'b'] }), {
    message: 'Invalid value string[] for bools, expected boolean[]',
    cause: {
      path: undefined,
      name: 'bools',
      found: ['a', 'b'],
    },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', true] }), {
    message:
      'Invalid value (string|boolean)[] for bools, expected boolean[]',
    cause: {
      path: undefined,
      name: 'bools',
      found: ['a', true],
    },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bools: ['a', true] }, 'blah.rc'), {
    message:
      'Invalid value (string|boolean)[] for bools, expected boolean[]',
    cause: {
      path: 'blah.rc',
      name: 'bools',
      found: ['a', true],
    },
  })
  //@ts-expect-error
  t.throws(() => j.setConfigValues({ bool: 1 }, 'blah.rc'), {
    message: 'Invalid value number for bool, expected boolean',
    cause: {
      path: 'blah.rc',
      name: 'bool',
      found: 1,
    },
  })
  t.end()
})
