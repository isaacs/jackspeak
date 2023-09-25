import t from 'tap'
import { jack } from '../dist/esm/index.js'

const j = jack({
  envPrefix: 'TEST',
  env: {
    TEST_FOO: '1',
    TEST_NO_FOO: '0',
  },
}).flag({
  foo: {},
  'no-foo': {},

  'no-bar': {},
  'no-no-bar': {},
})

t.throws(() => j.setConfigValues({ 'no-foo': true }), {
  message: `do not set 'no-foo', instead set 'foo' as desired.`,
})

//@ts-expect-error
t.throws(() => j.setConfigValues({ 'no-no-foo': true }), {
  message: `do not set 'no-no-foo', instead set 'foo' as desired.`,
})

// this is ok, because there's no 'bar'
j.setConfigValues({ 'no-bar': true })
t.throws(() => j.setConfigValues({ 'no-no-bar': true }), {
  message: `do not set 'no-no-bar', instead set 'no-bar' as desired.`,
})
