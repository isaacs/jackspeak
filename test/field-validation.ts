/* eslint-disable @typescript-eslint/no-unused-vars */
import t, { Test } from 'tap'
import { Jack, jack } from '../src/index.js'

const doesParse = (t: Test, fn: (j: Jack) => Jack) =>
  t.doesNotThrow(() => fn(jack()).parse())

const doesNotParse = (t: Test, fn: (j: Jack) => Jack) =>
  t.throws(() => fn(jack()).parse())

t.test('basic', async t => {
  doesNotParse(t, j =>
    j.addFields({
      //@ts-expect-error
      bad: {},
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      bad: {
        //@ts-expect-error
        type: 'stringg',
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      bad: {
        //@ts-expect-error
        validOptions: 'test',
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      bad: {
        //@ts-expect-error
        multiple: 100,
      },
    }),
  )
})

t.test('single string options', async t => {
  const TYPE = 'string'
  const METHOD = 'opt'
  const MULTIPLE = undefined
  const VALID_OPTIONS = ['x', 'y'] as const
  const DEF = 'x'
  const BAD = 1
  const BAD_TYPE = 'number'

  let MUST_BE: 'x' | 'y' = DEF
  let MUST_BE_TYPE: string = 'x'
  let MUST_BE_OR_UNDEF: 'x' | 'y' | undefined = undefined
  let MUST_BE_TYPE_OR_UNDEF: string | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the valid options
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.noDefault
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE = v.noDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.addNoDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type
  MUST_BE_TYPE = v.withDefault
  MUST_BE_TYPE = v.noDefault!
  MUST_BE_TYPE = v.addFieldWithDefault
  MUST_BE_TYPE = v.addFieldNoDefault!
  MUST_BE_TYPE = v.noDefaultNoVO!
  MUST_BE_TYPE = v.addNoDefaultNoVO!
  MUST_BE_TYPE = v.withDefaultNoVO
  MUST_BE_TYPE = v.addWithDefaultNoVO

  // Test assigning to the valid options or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  // Test assigning to the type or undefined
  MUST_BE_TYPE_OR_UNDEF = v.withDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: [DEF],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      addFieldWithConflictingDefault: {
        type: TYPE,
        default: DEF + 'a',
        validOptions: VALID_OPTIONS,
      },
    }),
  )
})

t.test('multiple string options', async t => {
  const TYPE = 'string'
  const METHOD = 'optList'
  const MULTIPLE = true
  const VALID_OPTIONS = ['x', 'y'] as const
  const DEF = ['x']
  const BAD = 1
  const BAD_TYPE = 'number'

  let MUST_BE: ('x' | 'y')[] = ['x']
  let MUST_BE_TYPE: string[] = ['x']
  let MUST_BE_OR_UNDEF: ('x' | 'y')[] | undefined = undefined
  let MUST_BE_TYPE_OR_UNDEF: string[] | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the valid options
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.noDefault
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE = v.noDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.addNoDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type
  MUST_BE_TYPE = v.withDefault
  MUST_BE_TYPE = v.noDefault!
  MUST_BE_TYPE = v.addFieldWithDefault
  MUST_BE_TYPE = v.addFieldNoDefault!
  MUST_BE_TYPE = v.noDefaultNoVO!
  MUST_BE_TYPE = v.addNoDefaultNoVO!
  MUST_BE_TYPE = v.withDefaultNoVO
  MUST_BE_TYPE = v.addWithDefaultNoVO

  // Test assigning to the valid options or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  // Test assigning to the type or undefined
  MUST_BE_TYPE_OR_UNDEF = v.withDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: DEF[0],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      addFieldWithConflictingDefault: {
        type: TYPE,
        default: DEF[0] + 'a',
        validOptions: VALID_OPTIONS,
      },
    }),
  )
})

t.test('single number options', async t => {
  const TYPE = 'number'
  const METHOD = 'num'
  const MULTIPLE = undefined
  const VALID_OPTIONS = [1, 2] as const
  const DEF = 1
  const BAD = 'x'
  const BAD_TYPE = 'string'

  let MUST_BE: 1 | 2 = 1
  let MUST_BE_TYPE: number = 1
  let MUST_BE_OR_UNDEF: 1 | 2 | undefined = undefined
  let MUST_BE_TYPE_OR_UNDEF: number | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the valid options
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.noDefault
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE = v.noDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.addNoDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type
  MUST_BE_TYPE = v.withDefault
  MUST_BE_TYPE = v.noDefault!
  MUST_BE_TYPE = v.addFieldWithDefault
  MUST_BE_TYPE = v.addFieldNoDefault!
  MUST_BE_TYPE = v.noDefaultNoVO!
  MUST_BE_TYPE = v.addNoDefaultNoVO!
  MUST_BE_TYPE = v.withDefaultNoVO
  MUST_BE_TYPE = v.addWithDefaultNoVO

  // Test assigning to the valid options or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  // Test assigning to the type or undefined
  MUST_BE_TYPE_OR_UNDEF = v.withDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: [DEF],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
})

t.test('multiple number options', async t => {
  const TYPE = 'number'
  const METHOD = 'numList'
  const MULTIPLE = true
  const VALID_OPTIONS = [1, 2] as const
  const DEF = [1]
  const BAD = 'x'
  const BAD_TYPE = 'string'

  let MUST_BE: (1 | 2)[] = [1]
  let MUST_BE_TYPE: number[] = [1]
  let MUST_BE_OR_UNDEF: (1 | 2)[] | undefined = undefined
  let MUST_BE_TYPE_OR_UNDEF: number[] | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the valid options
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.noDefault
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  //@ts-expect-error - without ! operator
  MUST_BE = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE = v.noDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.addNoDefaultNoVO!
  //@ts-expect-error
  MUST_BE = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type
  MUST_BE_TYPE = v.withDefault
  MUST_BE_TYPE = v.noDefault!
  MUST_BE_TYPE = v.addFieldWithDefault
  MUST_BE_TYPE = v.addFieldNoDefault!
  MUST_BE_TYPE = v.noDefaultNoVO!
  MUST_BE_TYPE = v.addNoDefaultNoVO!
  MUST_BE_TYPE = v.withDefaultNoVO
  MUST_BE_TYPE = v.addWithDefaultNoVO

  // Test assigning to the valid options or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  //@ts-expect-error
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  // Test assigning to the type or undefined
  MUST_BE_TYPE_OR_UNDEF = v.withDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_TYPE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_TYPE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_TYPE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: DEF[0],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
})

t.test('single boolean options', async t => {
  const TYPE = 'boolean'
  const METHOD = 'flag'
  const MULTIPLE = undefined
  const VALID_OPTIONS = undefined
  const DEF = true
  const BAD = 'x'
  const BAD_TYPE = 'string'

  let MUST_BE: true | false = true
  let MUST_BE_OR_UNDEF: true | false | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the same type
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  MUST_BE = v.noDefaultNoVO!
  MUST_BE = v.addNoDefaultNoVO!
  MUST_BE = v.withDefaultNoVO
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: [DEF],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
})

t.test('multiple number options', async t => {
  const TYPE = 'boolean'
  const METHOD = 'flagList'
  const MULTIPLE = true
  const VALID_OPTIONS = undefined
  const DEF = [true]
  const BAD = 'x'
  const BAD_TYPE = 'string'

  let MUST_BE: boolean[] = [true]
  let MUST_BE_OR_UNDEF: boolean[] | undefined = undefined

  const v = jack()
    [METHOD]({
      noDefault: {
        validOptions: VALID_OPTIONS,
      },
      withDefault: {
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      noDefaultNoVO: {},
      withDefaultNoVO: {
        default: DEF,
      },
    })
    .addFields({
      addFieldNoDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
      },
      addFieldWithDefault: {
        type: TYPE,
        multiple: MULTIPLE,
        validOptions: VALID_OPTIONS,
        default: DEF,
      },
      addNoDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
      },
      addWithDefaultNoVO: {
        type: TYPE,
        multiple: MULTIPLE,
        default: DEF,
      },
    })
    .parse([]).values

  // Test assigning to the same type
  MUST_BE = v.withDefault
  MUST_BE = v.noDefault!
  MUST_BE = v.addFieldWithDefault
  MUST_BE = v.addFieldNoDefault!
  MUST_BE = v.noDefaultNoVO!
  MUST_BE = v.addNoDefaultNoVO!
  MUST_BE = v.withDefaultNoVO
  MUST_BE = v.addWithDefaultNoVO

  // Test assigning to the same type or undefined
  MUST_BE_OR_UNDEF = v.withDefault
  MUST_BE_OR_UNDEF = v.noDefault
  MUST_BE_OR_UNDEF = v.addFieldWithDefault
  MUST_BE_OR_UNDEF = v.addFieldNoDefault
  MUST_BE_OR_UNDEF = v.noDefaultNoVO
  MUST_BE_OR_UNDEF = v.addNoDefaultNoVO
  MUST_BE_OR_UNDEF = v.withDefaultNoVO
  MUST_BE_OR_UNDEF = v.addWithDefaultNoVO

  doesParse(t, j =>
    j[METHOD]({
      withRedundant: {
        type: TYPE,
        multiple: MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongType: {
        //@ts-expect-error
        type: BAD_TYPE,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongDefaultType: {
        //@ts-expect-error
        default: BAD,
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongValidOptions: {
        //@ts-expect-error
        validOptions: [BAD],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultipleDefault: {
        //@ts-expect-error
        default: DEF[0],
      },
    }),
  )
  doesNotParse(t, j =>
    j[METHOD]({
      withWrongMultiple: {
        //@ts-expect-error
        multiple: !MULTIPLE,
      },
    }),
  )
  doesNotParse(t, j =>
    j.addFields({
      // TODO: can TS fail here?
      addFieldWithConflictingOptions: {
        type: TYPE,
        default: BAD,
        validOptions: [BAD],
      },
    }),
  )
})
