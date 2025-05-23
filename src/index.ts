import {
  inspect,
  InspectOptions,
  parseArgs,
  ParseArgsConfig,
} from 'node:util'

// it's a tiny API, just cast it inline, it's fine
//@ts-ignore
import cliui from '@isaacs/cliui'
import { basename } from 'node:path'

export type ParseArgsOptions = Exclude<
  ParseArgsConfig['options'],
  undefined
>
export type ParseArgsOption = ParseArgsOptions[string]
export type ParseArgsDefault = Exclude<ConfigValue, number | number[]>

export type ConfigType = 'number' | 'string' | 'boolean'

export const isConfigType = (t: unknown): t is ConfigType =>
  typeof t === 'string' &&
  (t === 'string' || t === 'number' || t === 'boolean')

export type ConfigValuePrimitive = string | boolean | number
export type ConfigValueArray = string[] | boolean[] | number[]
export type ConfigValue = ConfigValuePrimitive | ConfigValueArray

/**
 * Given a Jack object, get the typeof its ConfigSet
 */
export type Unwrap<J> = J extends Jack<infer C> ? C : never

/**
 * Defines the type of value that is valid, given a config definition's
 * {@link ConfigType} and boolean multiple setting
 */
export type ValidValue<
  T extends ConfigType = ConfigType,
  M extends boolean = boolean,
> =
  [T, M] extends ['number', true] ? number[]
  : [T, M] extends ['string', true] ? string[]
  : [T, M] extends ['boolean', true] ? boolean[]
  : [T, M] extends ['number', false] ? number
  : [T, M] extends ['string', false] ? string
  : [T, M] extends ['boolean', false] ? boolean
  : [T, M] extends ['string', boolean] ? string | string[]
  : [T, M] extends ['boolean', boolean] ? boolean | boolean[]
  : [T, M] extends ['number', boolean] ? number | number[]
  : [T, M] extends [ConfigType, false] ? ConfigValuePrimitive
  : [T, M] extends [ConfigType, true] ? ConfigValueArray
  : ConfigValue

const isValidValue = <T extends ConfigType, M extends boolean>(
  v: unknown,
  type: T,
  multi: M,
): v is ValidValue<T, M> => {
  if (multi) {
    if (!Array.isArray(v)) return false
    return !v.some((v: unknown) => !isValidValue(v, type, false))
  }
  if (Array.isArray(v)) return false
  return typeof v === type
}

export type ReadonlyArrays = readonly number[] | readonly string[]

/**
 * Defines the type of validOptions that are valid, given a config definition's
 * {@link ConfigType}
 */
export type ValidOptions<T extends ConfigType> =
  T extends 'boolean' ? undefined
  : T extends 'string' ? readonly string[]
  : T extends 'number' ? readonly number[]
  : ReadonlyArrays

const isValidOption = <T extends ConfigType>(
  v: unknown,
  vo: readonly unknown[],
): vo is Exclude<ValidOptions<T>, undefined> =>
  !!vo &&
  (Array.isArray(v) ? v.every(x => isValidOption(x, vo)) : vo.includes(v))

/**
 * A config field definition, in its full representation.
 * This is what is passed in to addFields so `type` is required.
 */
export type ConfigOption<
  T extends ConfigType = ConfigType,
  M extends boolean = boolean,
  O extends undefined | ValidOptions<T> = undefined | ValidOptions<T>,
> = {
  type: T
  short?: string
  default?: ValidValue<T, M> &
    (O extends ReadonlyArrays ?
      M extends false ?
        O[number]
      : O[number][]
    : unknown)
  description?: string
  hint?: T extends 'boolean' ? undefined : string
  validate?:
    | ((v: unknown) => v is ValidValue<T, M>)
    | ((v: unknown) => boolean)
  validOptions?: O
  delim?: M extends false ? undefined : string
  multiple?: M
}

/**
 * Determine whether an unknown object is a {@link ConfigOption} based only
 * on its `type` and `multiple` property
 */
export const isConfigOptionOfType = <
  T extends ConfigType,
  M extends boolean,
>(
  o: any,
  type: T,
  multi: M,
): o is ConfigOption<T, M> =>
  !!o &&
  typeof o === 'object' &&
  isConfigType(o.type) &&
  o.type === type &&
  !!o.multiple === multi

/**
 * Determine whether an unknown object is a {@link ConfigOption} based on
 * it having all valid properties
 */
export const isConfigOption = <T extends ConfigType, M extends boolean>(
  o: any,
  type: T,
  multi: M,
): o is ConfigOption<T, M> =>
  isConfigOptionOfType(o, type, multi) &&
  undefOrType(o.short, 'string') &&
  undefOrType(o.description, 'string') &&
  undefOrType(o.hint, 'string') &&
  undefOrType(o.validate, 'function') &&
  (o.type === 'boolean' ?
    o.validOptions === undefined
  : undefOrTypeArray(o.validOptions, o.type)) &&
  (o.default === undefined || isValidValue(o.default, type, multi))

/**
 * The meta information for a config option definition, when the
 * type and multiple values can be inferred by the method being used
 */
export type ConfigOptionMeta<
  T extends ConfigType,
  M extends boolean,
  O extends ConfigOption<T, M> = ConfigOption<T, M>,
> = Pick<Partial<O>, 'type'> & Omit<O, 'type'>

/**
 * A set of {@link ConfigOption} objects, referenced by their longOption
 * string values.
 */
export type ConfigSet = {
  [longOption: string]: ConfigOption
}

/**
 * A set of {@link ConfigOptionMeta} fields, referenced by their longOption
 * string values.
 */
export type ConfigMetaSet<T extends ConfigType, M extends boolean> = {
  [longOption: string]: ConfigOptionMeta<T, M>
}

/**
 * Infer {@link ConfigSet} fields from a given {@link ConfigMetaSet}
 */
export type ConfigSetFromMetaSet<
  T extends ConfigType,
  M extends boolean,
  S extends ConfigMetaSet<T, M>,
> = S & { [longOption in keyof S]: ConfigOption<T, M> }

/**
 * The 'values' field returned by {@link Jack#parse}. If a value has
 * a default field it will be required on the object otherwise it is optional.
 */
export type OptionsResults<T extends ConfigSet> = {
  [K in keyof T]:
    | (T[K]['validOptions'] extends ReadonlyArrays ?
        T[K] extends ConfigOption<'string' | 'number', false> ?
          T[K]['validOptions'][number]
        : T[K] extends ConfigOption<'string' | 'number', true> ?
          T[K]['validOptions'][number][]
        : never
      : T[K] extends ConfigOption<'string', false> ? string
      : T[K] extends ConfigOption<'string', true> ? string[]
      : T[K] extends ConfigOption<'number', false> ? number
      : T[K] extends ConfigOption<'number', true> ? number[]
      : T[K] extends ConfigOption<'boolean', false> ? boolean
      : T[K] extends ConfigOption<'boolean', true> ? boolean[]
      : never)
    | (T[K]['default'] extends ConfigValue ? never : undefined)
}

/**
 * The object retured by {@link Jack#parse}
 */
export type Parsed<T extends ConfigSet> = {
  values: OptionsResults<T>
  positionals: string[]
}

/**
 * A row used when generating the {@link Jack#usage} string
 */
export interface Row {
  left?: string
  text: string
  skipLine?: boolean
  type?: string
}

/**
 * A heading for a section in the usage, created by the jack.heading()
 * method.
 *
 * First heading is always level 1, subsequent headings default to 2.
 *
 * The level of the nearest heading level sets the indentation of the
 * description that follows.
 */
export interface Heading extends Row {
  type: 'heading'
  text: string
  left?: ''
  skipLine?: boolean
  level: number
  pre?: boolean
}

const isHeading = (r: { type?: string }): r is Heading =>
  r.type === 'heading'

/**
 * An arbitrary blob of text describing some stuff, set by the
 * jack.description() method.
 *
 * Indentation determined by level of the nearest header.
 */
export interface Description extends Row {
  type: 'description'
  text: string
  left?: ''
  skipLine?: boolean
  pre?: boolean
}

const isDescription = (r: { type?: string }): r is Description =>
  r.type === 'description'

/**
 * A heading or description row used when generating the {@link Jack#usage}
 * string
 */
export type TextRow = Heading | Description

/**
 * Either a {@link TextRow} or a reference to a {@link ConfigOption}
 */
export type UsageField =
  | TextRow
  | {
      type: 'config'
      name: string
      value: ConfigOption
    }

const width = Math.min(process?.stdout?.columns ?? 80, 80)

// indentation spaces from heading level
const indent = (n: number) => (n - 1) * 2

const toEnvKey = (pref: string, key: string): string =>
  [pref, key.replace(/[^a-zA-Z0-9]+/g, ' ')]
    .join(' ')
    .trim()
    .toUpperCase()
    .replace(/ /g, '_')

const toEnvVal = (value: ConfigValue, delim: string = '\n'): string => {
  const str =
    typeof value === 'string' ? value
    : typeof value === 'boolean' ?
      value ? '1'
      : '0'
    : typeof value === 'number' ? String(value)
    : Array.isArray(value) ?
      value.map((v: ConfigValue) => toEnvVal(v)).join(delim)
    : /* c8 ignore start */ undefined
  if (typeof str !== 'string') {
    throw new Error(
      `could not serialize value to environment: ${JSON.stringify(value)}`,
      { cause: { code: 'JACKSPEAK' } },
    )
  }
  /* c8 ignore stop */
  return str
}

const fromEnvVal = <T extends ConfigType, M extends boolean>(
  env: string,
  type: T,
  multiple: M,
  delim: string = '\n',
): ValidValue<T, M> =>
  (multiple ?
    env ? env.split(delim).map(v => fromEnvVal(v, type, false))
    : []
  : type === 'string' ? env
  : type === 'boolean' ? env === '1'
  : +env.trim()) as ValidValue<T, M>

const undefOrType = (v: unknown, t: string): boolean =>
  v === undefined || typeof v === t

const undefOrTypeArray = (v: unknown, t: string): boolean =>
  v === undefined || (Array.isArray(v) && v.every(x => typeof x === t))

// print the value type, for error message reporting
const valueType = (
  v: ConfigValue | { type: ConfigType; multiple?: boolean },
): string =>
  typeof v === 'string' ? 'string'
  : typeof v === 'boolean' ? 'boolean'
  : typeof v === 'number' ? 'number'
  : Array.isArray(v) ?
    `${joinTypes([...new Set(v.map(v => valueType(v)))])}[]`
  : `${v.type}${v.multiple ? '[]' : ''}`

const joinTypes = (types: string[]): string =>
  types.length === 1 && typeof types[0] === 'string' ?
    types[0]
  : `(${types.join('|')})`

const validateFieldMeta = <T extends ConfigType, M extends boolean>(
  field: ConfigOptionMeta<T, M>,
  fieldMeta?: { type: T; multiple: M },
): { type: ConfigType; multiple: boolean } => {
  if (fieldMeta) {
    if (field.type !== undefined && field.type !== fieldMeta.type) {
      throw new TypeError(`invalid type`, {
        cause: {
          found: field.type,
          wanted: [fieldMeta.type, undefined],
        },
      })
    }
    if (
      field.multiple !== undefined &&
      !!field.multiple !== fieldMeta.multiple
    ) {
      throw new TypeError(`invalid multiple`, {
        cause: {
          found: field.multiple,
          wanted: [fieldMeta.multiple, undefined],
        },
      })
    }
    return fieldMeta
  }

  if (!isConfigType(field.type)) {
    throw new TypeError(`invalid type`, {
      cause: {
        found: field.type,
        wanted: ['string', 'number', 'boolean'],
      },
    })
  }

  return {
    type: field.type,
    multiple: !!field.multiple,
  }
}

const validateField = (
  o: ConfigOption,
  type: ConfigType,
  multiple: boolean,
): ConfigOption => {
  const validateValidOptions = <
    T extends ConfigValue | undefined,
    V extends T extends Array<infer U> ? U : T,
  >(
    def: T | undefined,
    validOptions: readonly V[] | undefined,
  ) => {
    if (!undefOrTypeArray(validOptions, type)) {
      throw new TypeError('invalid validOptions', {
        cause: {
          found: validOptions,
          wanted: valueType({ type, multiple: true }),
        },
      })
    }
    if (def !== undefined && validOptions !== undefined) {
      const valid =
        Array.isArray(def) ?
          def.every(v => validOptions.includes(v as V))
        : validOptions.includes(def as V)
      if (!valid) {
        throw new TypeError('invalid default value not in validOptions', {
          cause: {
            found: def,
            wanted: validOptions,
          },
        })
      }
    }
  }

  if (
    o.default !== undefined &&
    !isValidValue(o.default, type, multiple)
  ) {
    throw new TypeError('invalid default value', {
      cause: {
        found: o.default,
        wanted: valueType({ type, multiple }),
      },
    })
  }

  if (
    isConfigOptionOfType(o, 'number', false) ||
    isConfigOptionOfType(o, 'number', true)
  ) {
    validateValidOptions(o.default, o.validOptions)
  } else if (
    isConfigOptionOfType(o, 'string', false) ||
    isConfigOptionOfType(o, 'string', true)
  ) {
    validateValidOptions(o.default, o.validOptions)
  } else if (
    isConfigOptionOfType(o, 'boolean', false) ||
    isConfigOptionOfType(o, 'boolean', true)
  ) {
    if (o.hint !== undefined) {
      throw new TypeError('cannot provide hint for flag')
    }
    if (o.validOptions !== undefined) {
      throw new TypeError('cannot provide validOptions for flag')
    }
  }

  return o
}

const toParseArgsOptionsConfig = (
  options: ConfigSet,
): ParseArgsOptions => {
  return Object.entries(options).reduce((acc, [longOption, o]) => {
    const p: ParseArgsOption = {
      type: 'string',
      multiple: !!o.multiple,
      ...(typeof o.short === 'string' ? { short: o.short } : undefined),
    }
    const setNoBool = () => {
      if (!longOption.startsWith('no-') && !options[`no-${longOption}`]) {
        acc[`no-${longOption}`] = {
          type: 'boolean',
          multiple: !!o.multiple,
        }
      }
    }
    const setDefault = <T>(
      def: T | undefined,
      fn: (d: T) => ParseArgsDefault,
    ) => {
      if (def !== undefined) {
        p.default = fn(def)
      }
    }
    if (isConfigOption(o, 'number', false)) {
      setDefault(o.default, String)
    } else if (isConfigOption(o, 'number', true)) {
      setDefault(o.default, d => d.map(v => String(v)))
    } else if (
      isConfigOption(o, 'string', false) ||
      isConfigOption(o, 'string', true)
    ) {
      setDefault(o.default, v => v)
    } else if (
      isConfigOption(o, 'boolean', false) ||
      isConfigOption(o, 'boolean', true)
    ) {
      p.type = 'boolean'
      setDefault(o.default, v => v)
      setNoBool()
    }
    acc[longOption] = p
    return acc
  }, {} as ParseArgsOptions)
}

/**
 * Options provided to the {@link Jack} constructor
 */
export interface JackOptions {
  /**
   * Whether to allow positional arguments
   *
   * @default true
   */
  allowPositionals?: boolean

  /**
   * Prefix to use when reading/writing the environment variables
   *
   * If not specified, environment behavior will not be available.
   */
  envPrefix?: string

  /**
   * Environment object to read/write. Defaults `process.env`.
   * No effect if `envPrefix` is not set.
   */
  env?: Record<string, string | undefined>

  /**
   * A short usage string. If not provided, will be generated from the
   * options provided, but that can of course be rather verbose if
   * there are a lot of options.
   */
  usage?: string

  /**
   * Stop parsing flags and opts at the first positional argument.
   * This is to support cases like `cmd [flags] <subcmd> [options]`, where
   * each subcommand may have different options.  This effectively treats
   * any positional as a `--` argument.  Only relevant if `allowPositionals`
   * is true.
   *
   * To do subcommands, set this option, look at the first positional, and
   * parse the remaining positionals as appropriate.
   *
   * @default false
   */
  stopAtPositional?: boolean

  /**
   * Conditional `stopAtPositional`. If set to a `(string)=>boolean` function,
   * will be called with each positional argument encountered. If the function
   * returns true, then parsing will stop at that point.
   */
  stopAtPositionalTest?: (arg: string) => boolean
}

/**
 * Class returned by the {@link jack} function and all configuration
 * definition methods.  This is what gets chained together.
 */
export class Jack<C extends ConfigSet = {}> {
  #configSet: C
  #shorts: Record<string, string>
  #options: JackOptions
  #fields: UsageField[] = []
  #env: Record<string, string | undefined>
  #envPrefix?: string
  #allowPositionals: boolean
  #usage?: string
  #usageMarkdown?: string

  constructor(options: JackOptions = {}) {
    this.#options = options
    this.#allowPositionals = options.allowPositionals !== false
    this.#env =
      this.#options.env === undefined ? process.env : this.#options.env
    this.#envPrefix = options.envPrefix
    // We need to fib a little, because it's always the same object, but it
    // starts out as having an empty config set.  Then each method that adds
    // fields returns `this as Jack<C & { ...newConfigs }>`
    this.#configSet = Object.create(null) as C
    this.#shorts = Object.create(null)
  }

  /**
   * Resulting definitions, suitable to be passed to Node's `util.parseArgs`,
   * but also including `description` and `short` fields, if set.
   */
  get definitions(): C {
    return this.#configSet
  }

  /** map of `{ <short>: <long> }` strings for each short name defined */
  get shorts() {
    return this.#shorts
  }

  /**
   * options passed to the {@link Jack} constructor
   */
  get jackOptions() {
    return this.#options
  }

  /**
   * the data used to generate {@link Jack#usage} and
   * {@link Jack#usageMarkdown} content.
   */
  get usageFields() {
    return this.#fields
  }

  /**
   * Set the default value (which will still be overridden by env or cli)
   * as if from a parsed config file. The optional `source` param, if
   * provided, will be included in error messages if a value is invalid or
   * unknown.
   */
  setConfigValues(values: Partial<OptionsResults<C>>, source = '') {
    try {
      this.validate(values)
    } catch (er) {
      if (source && er instanceof Error) {
        /* c8 ignore next */
        const cause = typeof er.cause === 'object' ? er.cause : {}
        er.cause = { ...cause, path: source }
        Error.captureStackTrace(er, this.setConfigValues)
      }
      throw er
    }
    for (const [field, value] of Object.entries(values)) {
      const my = this.#configSet[field]
      // already validated, just for TS's benefit
      /* c8 ignore start */
      if (!my) {
        throw new Error('unexpected field in config set: ' + field, {
          cause: {
            code: 'JACKSPEAK',
            found: field,
          },
        })
      }
      /* c8 ignore stop */
      my.default = value as ConfigValue
    }
    return this
  }

  /**
   * Parse a string of arguments, and return the resulting
   * `{ values, positionals }` object.
   *
   * If an {@link JackOptions#envPrefix} is set, then it will read default
   * values from the environment, and write the resulting values back
   * to the environment as well.
   *
   * Environment values always take precedence over any other value, except
   * an explicit CLI setting.
   */
  parse(args: string[] = process.argv): Parsed<C> {
    this.loadEnvDefaults()
    const p = this.parseRaw(args)
    this.applyDefaults(p)
    this.writeEnv(p)
    return p
  }

  loadEnvDefaults() {
    if (this.#envPrefix) {
      for (const [field, my] of Object.entries(this.#configSet)) {
        const ek = toEnvKey(this.#envPrefix, field)
        const env = this.#env[ek]
        if (env !== undefined) {
          my.default = fromEnvVal(env, my.type, !!my.multiple, my.delim)
        }
      }
    }
  }

  applyDefaults(p: Parsed<C>) {
    for (const [field, c] of Object.entries(this.#configSet)) {
      if (c.default !== undefined && !(field in p.values)) {
        //@ts-ignore
        p.values[field] = c.default
      }
    }
  }

  /**
   * Only parse the command line arguments passed in.
   * Does not strip off the `node script.js` bits, so it must be just the
   * arguments you wish to have parsed.
   * Does not read from or write to the environment, or set defaults.
   */
  parseRaw(args: string[]): Parsed<C> {
    if (args === process.argv) {
      args = args.slice(
        (process as { _eval?: string })._eval !== undefined ? 1 : 2,
      )
    }

    const result = parseArgs({
      args,
      options: toParseArgsOptionsConfig(this.#configSet),
      // always strict, but using our own logic
      strict: false,
      allowPositionals: this.#allowPositionals,
      tokens: true,
    })

    const p: Parsed<C> = {
      values: {} as OptionsResults<C>,
      positionals: [],
    }
    for (const token of result.tokens) {
      if (token.kind === 'positional') {
        p.positionals.push(token.value)
        if (
          this.#options.stopAtPositional ||
          this.#options.stopAtPositionalTest?.(token.value)
        ) {
          p.positionals.push(...args.slice(token.index + 1))
          break
        }
      } else if (token.kind === 'option') {
        let value: ConfigValue | undefined = undefined
        if (token.name.startsWith('no-')) {
          const my = this.#configSet[token.name]
          const pname = token.name.substring('no-'.length)
          const pos = this.#configSet[pname]
          if (
            pos &&
            pos.type === 'boolean' &&
            (!my ||
              (my.type === 'boolean' && !!my.multiple === !!pos.multiple))
          ) {
            value = false
            token.name = pname
          }
        }
        const my = this.#configSet[token.name]
        if (!my) {
          throw new Error(
            `Unknown option '${token.rawName}'. ` +
              `To specify a positional argument starting with a '-', ` +
              `place it at the end of the command after '--', as in ` +
              `'-- ${token.rawName}'`,
            {
              cause: {
                code: 'JACKSPEAK',
                found:
                  token.rawName + (token.value ? `=${token.value}` : ''),
              },
            },
          )
        }
        if (value === undefined) {
          if (token.value === undefined) {
            if (my.type !== 'boolean') {
              throw new Error(
                `No value provided for ${token.rawName}, expected ${my.type}`,
                {
                  cause: {
                    code: 'JACKSPEAK',
                    name: token.rawName,
                    wanted: valueType(my),
                  },
                },
              )
            }
            value = true
          } else {
            if (my.type === 'boolean') {
              throw new Error(
                `Flag ${token.rawName} does not take a value, received '${token.value}'`,
                { cause: { code: 'JACKSPEAK', found: token } },
              )
            }
            if (my.type === 'string') {
              value = token.value
            } else {
              value = +token.value
              if (value !== value) {
                throw new Error(
                  `Invalid value '${token.value}' provided for ` +
                    `'${token.rawName}' option, expected number`,
                  {
                    cause: {
                      code: 'JACKSPEAK',
                      name: token.rawName,
                      found: token.value,
                      wanted: 'number',
                    },
                  },
                )
              }
            }
          }
        }
        if (my.multiple) {
          const pv = p.values as Record<string, ConfigValue[]>
          const tn = pv[token.name] ?? []
          pv[token.name] = tn
          tn.push(value)
        } else {
          const pv = p.values as Record<string, ConfigValue>
          pv[token.name] = value
        }
      }
    }

    for (const [field, value] of Object.entries(p.values)) {
      const valid = this.#configSet[field]?.validate
      const validOptions = this.#configSet[field]?.validOptions
      const cause =
        validOptions && !isValidOption(value, validOptions) ?
          { name: field, found: value, validOptions }
        : valid && !valid(value) ? { name: field, found: value }
        : undefined
      if (cause) {
        throw new Error(
          `Invalid value provided for --${field}: ${JSON.stringify(value)}`,
          { cause: { ...cause, code: 'JACKSPEAK' } },
        )
      }
    }

    return p
  }

  /**
   * do not set fields as 'no-foo' if 'foo' exists and both are bools
   * just set foo.
   */
  #noNoFields(f: string, val: unknown, s: string = f) {
    if (!f.startsWith('no-') || typeof val !== 'boolean') return
    const yes = f.substring('no-'.length)
    // recurse so we get the core config key we care about.
    this.#noNoFields(yes, val, s)
    if (this.#configSet[yes]?.type === 'boolean') {
      throw new Error(
        `do not set '${s}', instead set '${yes}' as desired.`,
        { cause: { code: 'JACKSPEAK', found: s, wanted: yes } },
      )
    }
  }

  /**
   * Validate that any arbitrary object is a valid configuration `values`
   * object.  Useful when loading config files or other sources.
   */
  validate(o: unknown): asserts o is Parsed<C>['values'] {
    if (!o || typeof o !== 'object') {
      throw new Error('Invalid config: not an object', {
        cause: { code: 'JACKSPEAK', found: o },
      })
    }
    const opts = o as Record<string, ValidValue>
    for (const field in o) {
      const value = opts[field]
      /* c8 ignore next - for TS */
      if (value === undefined) continue
      this.#noNoFields(field, value)
      const config = this.#configSet[field]
      if (!config) {
        throw new Error(`Unknown config option: ${field}`, {
          cause: { code: 'JACKSPEAK', found: field },
        })
      }
      if (!isValidValue(value, config.type, !!config.multiple)) {
        throw new Error(
          `Invalid value ${valueType(value)} for ${field}, expected ${valueType(config)}`,
          {
            cause: {
              code: 'JACKSPEAK',
              name: field,
              found: value,
              wanted: valueType(config),
            },
          },
        )
      }
      const cause =
        config.validOptions && !isValidOption(value, config.validOptions) ?
          { name: field, found: value, validOptions: config.validOptions }
        : config.validate && !config.validate(value) ?
          { name: field, found: value }
        : undefined
      if (cause) {
        throw new Error(`Invalid config value for ${field}: ${value}`, {
          cause: { ...cause, code: 'JACKSPEAK' },
        })
      }
    }
  }

  writeEnv(p: Parsed<C>) {
    if (!this.#env || !this.#envPrefix) return
    for (const [field, value] of Object.entries(p.values)) {
      const my = this.#configSet[field]
      this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(
        value as ConfigValue,
        my?.delim,
      )
    }
  }

  /**
   * Add a heading to the usage output banner
   */
  heading(
    text: string,
    level?: 1 | 2 | 3 | 4 | 5 | 6,
    { pre = false }: { pre?: boolean } = {},
  ): Jack<C> {
    if (level === undefined) {
      level = this.#fields.some(r => isHeading(r)) ? 2 : 1
    }
    this.#fields.push({ type: 'heading', text, level, pre })
    return this
  }

  /**
   * Add a long-form description to the usage output at this position.
   */
  description(text: string, { pre }: { pre?: boolean } = {}): Jack<C> {
    this.#fields.push({ type: 'description', text, pre })
    return this
  }

  /**
   * Add one or more number fields.
   */
  num<F extends ConfigMetaSet<'number', false>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'number', false, F>> {
    return this.#addFieldsWith(fields, 'number', false)
  }

  /**
   * Add one or more multiple number fields.
   */
  numList<F extends ConfigMetaSet<'number', true>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'number', true, F>> {
    return this.#addFieldsWith(fields, 'number', true)
  }

  /**
   * Add one or more string option fields.
   */
  opt<F extends ConfigMetaSet<'string', false>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'string', false, F>> {
    return this.#addFieldsWith(fields, 'string', false)
  }

  /**
   * Add one or more multiple string option fields.
   */
  optList<F extends ConfigMetaSet<'string', true>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'string', true, F>> {
    return this.#addFieldsWith(fields, 'string', true)
  }

  /**
   * Add one or more flag fields.
   */
  flag<F extends ConfigMetaSet<'boolean', false>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'boolean', false, F>> {
    return this.#addFieldsWith(fields, 'boolean', false)
  }

  /**
   * Add one or more multiple flag fields.
   */
  flagList<F extends ConfigMetaSet<'boolean', true>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'boolean', true, F>> {
    return this.#addFieldsWith(fields, 'boolean', true)
  }

  /**
   * Generic field definition method. Similar to flag/flagList/number/etc,
   * but you must specify the `type` (and optionally `multiple` and `delim`)
   * fields on each one, or Jack won't know how to define them.
   */
  addFields<F extends ConfigSet>(fields: F): Jack<C & F> {
    return this.#addFields(this as unknown as Jack<C & F>, fields)
  }

  #addFieldsWith<
    T extends ConfigType,
    M extends boolean,
    F extends ConfigMetaSet<T, M>,
    O extends ConfigSetFromMetaSet<T, M, F>,
  >(fields: F, type: ConfigType, multiple: boolean): Jack<C & O> {
    return this.#addFields(this as unknown as Jack<C & O>, fields, {
      type,
      multiple,
    })
  }

  #addFields<
    T extends ConfigType,
    M extends boolean,
    F extends ConfigMetaSet<T, M>,
    O extends Jack,
  >(next: O, fields: F, opt?: { type: T; multiple: M }): O {
    Object.assign(
      next.#configSet,
      Object.fromEntries(
        Object.entries(fields).map(([name, field]) => {
          this.#validateName(name, field)
          const { type, multiple } = validateFieldMeta(field, opt)
          const value = { ...field, type, multiple }
          validateField(value, type, multiple)
          next.#fields.push({ type: 'config', name, value })
          return [name, value]
        }),
      ),
    )
    return next
  }

  #validateName(name: string, field: { short?: string }) {
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(name)) {
      throw new TypeError(
        `Invalid option name: ${name}, ` +
          `must be '-' delimited ASCII alphanumeric`,
      )
    }
    if (this.#configSet[name]) {
      throw new TypeError(`Cannot redefine option ${field}`)
    }
    if (this.#shorts[name]) {
      throw new TypeError(
        `Cannot redefine option ${name}, already ` +
          `in use for ${this.#shorts[name]}`,
      )
    }
    if (field.short) {
      if (!/^[a-zA-Z0-9]$/.test(field.short)) {
        throw new TypeError(
          `Invalid ${name} short option: ${field.short}, ` +
            'must be 1 ASCII alphanumeric character',
        )
      }
      if (this.#shorts[field.short]) {
        throw new TypeError(
          `Invalid ${name} short option: ${field.short}, ` +
            `already in use for ${this.#shorts[field.short]}`,
        )
      }
      this.#shorts[field.short] = name
      this.#shorts[name] = name
    }
  }

  /**
   * Return the usage banner for the given configuration
   */
  usage(): string {
    if (this.#usage) return this.#usage

    let headingLevel = 1
    //@ts-ignore
    const ui = cliui({ width })
    const first = this.#fields[0]
    let start = first?.type === 'heading' ? 1 : 0
    if (first?.type === 'heading') {
      ui.div({
        padding: [0, 0, 0, 0],
        text: normalize(first.text),
      })
    }
    ui.div({ padding: [0, 0, 0, 0], text: 'Usage:' })
    if (this.#options.usage) {
      ui.div({
        text: this.#options.usage,
        padding: [0, 0, 0, 2],
      })
    } else {
      const cmd = basename(String(process.argv[1]))
      const shortFlags: string[] = []
      const shorts: string[][] = []
      const flags: string[] = []
      const opts: string[][] = []
      for (const [field, config] of Object.entries(this.#configSet)) {
        if (config.short) {
          if (config.type === 'boolean') shortFlags.push(config.short)
          else shorts.push([config.short, config.hint || field])
        } else {
          if (config.type === 'boolean') flags.push(field)
          else opts.push([field, config.hint || field])
        }
      }
      const sf = shortFlags.length ? ' -' + shortFlags.join('') : ''
      const so = shorts.map(([k, v]) => ` --${k}=<${v}>`).join('')
      const lf = flags.map(k => ` --${k}`).join('')
      const lo = opts.map(([k, v]) => ` --${k}=<${v}>`).join('')
      const usage = `${cmd}${sf}${so}${lf}${lo}`.trim()
      ui.div({
        text: usage,
        padding: [0, 0, 0, 2],
      })
    }

    ui.div({ padding: [0, 0, 0, 0], text: '' })
    const maybeDesc = this.#fields[start]
    if (maybeDesc && isDescription(maybeDesc)) {
      const print = normalize(maybeDesc.text, maybeDesc.pre)
      start++
      ui.div({ padding: [0, 0, 0, 0], text: print })
      ui.div({ padding: [0, 0, 0, 0], text: '' })
    }

    const { rows, maxWidth } = this.#usageRows(start)

    // every heading/description after the first gets indented by 2
    // extra spaces.
    for (const row of rows) {
      if (row.left) {
        // If the row is too long, don't wrap it
        // Bump the right-hand side down a line to make room
        const configIndent = indent(Math.max(headingLevel, 2))
        if (row.left.length > maxWidth - 3) {
          ui.div({ text: row.left, padding: [0, 0, 0, configIndent] })
          ui.div({ text: row.text, padding: [0, 0, 0, maxWidth] })
        } else {
          ui.div(
            {
              text: row.left,
              padding: [0, 1, 0, configIndent],
              width: maxWidth,
            },
            { padding: [0, 0, 0, 0], text: row.text },
          )
        }
        if (row.skipLine) {
          ui.div({ padding: [0, 0, 0, 0], text: '' })
        }
      } else {
        if (isHeading(row)) {
          const { level } = row
          headingLevel = level
          // only h1 and h2 have bottom padding
          // h3-h6 do not
          const b = level <= 2 ? 1 : 0
          ui.div({ ...row, padding: [0, 0, b, indent(level)] })
        } else {
          ui.div({ ...row, padding: [0, 0, 1, indent(headingLevel + 1)] })
        }
      }
    }

    return (this.#usage = ui.toString())
  }

  /**
   * Return the usage banner markdown for the given configuration
   */
  usageMarkdown(): string {
    if (this.#usageMarkdown) return this.#usageMarkdown

    const out: string[] = []

    let headingLevel = 1
    const first = this.#fields[0]
    let start = first?.type === 'heading' ? 1 : 0
    if (first?.type === 'heading') {
      out.push(`# ${normalizeOneLine(first.text)}`)
    }
    out.push('Usage:')
    if (this.#options.usage) {
      out.push(normalizeMarkdown(this.#options.usage, true))
    } else {
      const cmd = basename(String(process.argv[1]))
      const shortFlags: string[] = []
      const shorts: string[][] = []
      const flags: string[] = []
      const opts: string[][] = []
      for (const [field, config] of Object.entries(this.#configSet)) {
        if (config.short) {
          if (config.type === 'boolean') shortFlags.push(config.short)
          else shorts.push([config.short, config.hint || field])
        } else {
          if (config.type === 'boolean') flags.push(field)
          else opts.push([field, config.hint || field])
        }
      }
      const sf = shortFlags.length ? ' -' + shortFlags.join('') : ''
      const so = shorts.map(([k, v]) => ` --${k}=<${v}>`).join('')
      const lf = flags.map(k => ` --${k}`).join('')
      const lo = opts.map(([k, v]) => ` --${k}=<${v}>`).join('')
      const usage = `${cmd}${sf}${so}${lf}${lo}`.trim()
      out.push(normalizeMarkdown(usage, true))
    }

    const maybeDesc = this.#fields[start]
    if (maybeDesc && isDescription(maybeDesc)) {
      out.push(normalizeMarkdown(maybeDesc.text, maybeDesc.pre))
      start++
    }

    const { rows } = this.#usageRows(start)

    // heading level in markdown is number of # ahead of text
    for (const row of rows) {
      if (row.left) {
        out.push(
          '#'.repeat(headingLevel + 1) +
            ' ' +
            normalizeOneLine(row.left, true),
        )
        if (row.text) out.push(normalizeMarkdown(row.text))
      } else if (isHeading(row)) {
        const { level } = row
        headingLevel = level
        out.push(
          `${'#'.repeat(headingLevel)} ${normalizeOneLine(
            row.text,
            row.pre,
          )}`,
        )
      } else {
        out.push(normalizeMarkdown(row.text, !!(row as Description).pre))
      }
    }

    return (this.#usageMarkdown = out.join('\n\n') + '\n')
  }

  #usageRows(start: number) {
    // turn each config type into a row, and figure out the width of the
    // left hand indentation for the option descriptions.
    let maxMax = Math.max(12, Math.min(26, Math.floor(width / 3)))
    let maxWidth = 8
    let prev: Row | TextRow | undefined = undefined
    const rows: (Row | TextRow)[] = []
    for (const field of this.#fields.slice(start)) {
      if (field.type !== 'config') {
        if (prev?.type === 'config') prev.skipLine = true
        prev = undefined
        field.text = normalize(field.text, !!field.pre)
        rows.push(field)
        continue
      }
      const { value } = field
      const desc = value.description || ''
      const mult = value.multiple ? 'Can be set multiple times' : ''
      const opts =
        value.validOptions?.length ?
          `Valid options:${value.validOptions.map(
            v => ` ${JSON.stringify(v)}`,
          )}`
        : ''
      const dmDelim = desc.includes('\n') ? '\n\n' : '\n'
      const extra = [opts, mult].join(dmDelim).trim()
      const text = (normalize(desc) + dmDelim + extra).trim()
      const hint =
        value.hint ||
        (value.type === 'number' ? 'n'
        : value.type === 'string' ? field.name
        : undefined)
      const short =
        !value.short ? ''
        : value.type === 'boolean' ? `-${value.short} `
        : `-${value.short}<${hint}> `
      const left =
        value.type === 'boolean' ?
          `${short}--${field.name}`
        : `${short}--${field.name}=<${hint}>`
      const row: Row = { text, left, type: 'config' }
      if (text.length > width - maxMax) {
        row.skipLine = true
      }
      if (prev && left.length > maxMax) prev.skipLine = true
      prev = row
      const len = left.length + 4
      if (len > maxWidth && len < maxMax) {
        maxWidth = len
      }

      rows.push(row)
    }

    return { rows, maxWidth }
  }

  /**
   * Return the configuration options as a plain object
   */
  toJSON() {
    return Object.fromEntries(
      Object.entries(this.#configSet).map(([field, def]) => [
        field,
        {
          type: def.type,
          ...(def.multiple ? { multiple: true } : {}),
          ...(def.delim ? { delim: def.delim } : {}),
          ...(def.short ? { short: def.short } : {}),
          ...(def.description ?
            { description: normalize(def.description) }
          : {}),
          ...(def.validate ? { validate: def.validate } : {}),
          ...(def.validOptions ? { validOptions: def.validOptions } : {}),
          ...(def.default !== undefined ? { default: def.default } : {}),
          ...(def.hint ? { hint: def.hint } : {}),
        },
      ]),
    )
  }

  /**
   * Custom printer for `util.inspect`
   */
  [inspect.custom](_: number, options: InspectOptions) {
    return `Jack ${inspect(this.toJSON(), options)}`
  }
}

/**
 * Main entry point. Create and return a {@link Jack} object.
 */
export const jack = (options: JackOptions = {}) => new Jack(options)

// Unwrap and un-indent, so we can wrap description
// strings however makes them look nice in the code.
const normalize = (s: string, pre = false) => {
  if (pre)
    // prepend a ZWSP to each line so cliui doesn't strip it.
    return s
      .split('\n')
      .map(l => `\u200b${l}`)
      .join('\n')
  return s
    .split(/^\s*```\s*$/gm)
    .map((s, i) => {
      if (i % 2 === 1) {
        if (!s.trim()) {
          return `\`\`\`\n\`\`\`\n`
        }
        // outdent the ``` blocks, but preserve whitespace otherwise.
        const split = s.split('\n')
        // throw out the \n at the start and end
        split.pop()
        split.shift()
        const si = split.reduce((shortest, l) => {
          /* c8 ignore next */
          const ind = l.match(/^\s*/)?.[0] ?? ''
          if (ind.length) return Math.min(ind.length, shortest)
          else return shortest
        }, Infinity)
        /* c8 ignore next */
        const i = isFinite(si) ? si : 0
        return (
          '\n```\n' +
          split.map(s => `\u200b${s.substring(i)}`).join('\n') +
          '\n```\n'
        )
      }
      return (
        s
          // remove single line breaks, except for lists
          .replace(/([^\n])\n[ \t]*([^\n])/g, (_, $1, $2) =>
            !/^[-*]/.test($2) ? `${$1} ${$2}` : `${$1}\n${$2}`,
          )
          // normalize mid-line whitespace
          .replace(/([^\n])[ \t]+([^\n])/g, '$1 $2')
          // two line breaks are enough
          .replace(/\n{3,}/g, '\n\n')
          // remove any spaces at the start of a line
          .replace(/\n[ \t]+/g, '\n')
          .trim()
      )
    })
    .join('\n')
}

// normalize for markdown printing, remove leading spaces on lines
const normalizeMarkdown = (s: string, pre: boolean = false): string => {
  const n = normalize(s, pre).replace(/\\/g, '\\\\')
  return pre ?
      `\`\`\`\n${n.replace(/\u200b/g, '')}\n\`\`\``
    : n.replace(/\n +/g, '\n').trim()
}

const normalizeOneLine = (s: string, pre: boolean = false) => {
  const n = normalize(s, pre)
    .replace(/[\s\u200b]+/g, ' ')
    .trim()
  return pre ? `\`${n}\`` : n
}
