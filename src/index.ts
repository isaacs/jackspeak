export type ConfigType = 'number' | 'string' | 'boolean'

/**
 * Given a Jack object, get the typeof its ConfigSet
 */
export type Unwrap<J> = J extends Jack<infer C> ? C : never

import { inspect, InspectOptions, ParseArgsConfig } from 'node:util'
import { parseArgs } from './parse-args.js'

// it's a tiny API, just cast it inline, it's fine
//@ts-ignore
import cliui from '@isaacs/cliui'
import { basename } from 'node:path'

const width = Math.min(
  (process && process.stdout && process.stdout.columns) || 80,
  80,
)

// indentation spaces from heading level
const indent = (n: number) => (n - 1) * 2

const toEnvKey = (pref: string, key: string): string => {
  return [pref, key.replace(/[^a-zA-Z0-9]+/g, ' ')]
    .join(' ')
    .trim()
    .toUpperCase()
    .replace(/ /g, '_')
}

const toEnvVal = (
  value: string | boolean | number | string[] | boolean[] | number[],
  delim: string = '\n',
): string => {
  const str =
    typeof value === 'string' ? value
    : typeof value === 'boolean' ?
      value ? '1'
      : '0'
    : typeof value === 'number' ? String(value)
    : Array.isArray(value) ?
      value.map((v: string | number | boolean) => toEnvVal(v)).join(delim)
    : /* c8 ignore start */ undefined
  if (typeof str !== 'string') {
    throw new Error(
      `could not serialize value to environment: ${JSON.stringify(value)}`,
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
  : [T, M] extends [ConfigType, false] ? string | number | boolean
  : [T, M] extends [ConfigType, true] ? string[] | number[] | boolean[]
  : string | number | boolean | string[] | number[] | boolean[]

/**
 * The meta information for a config option definition, when the
 * type and multiple values can be inferred by the method being used
 */
export type ConfigOptionMeta<
  T extends ConfigType,
  M extends boolean = boolean,
  O extends
    | undefined
    | (T extends 'boolean' ? never
      : T extends 'string' ? readonly string[]
      : T extends 'number' ? readonly number[]
      : readonly number[] | readonly string[]) =
    | undefined
    | (T extends 'boolean' ? never
      : T extends 'string' ? readonly string[]
      : T extends 'number' ? readonly number[]
      : readonly number[] | readonly string[]),
> = {
  default?:
    | undefined
    | (ValidValue<T, M> &
        (O extends number[] | string[] ?
          M extends false ?
            O[number]
          : O[number][]
        : unknown))
  validOptions?: O
  description?: string
  validate?:
    | ((v: unknown) => v is ValidValue<T, M>)
    | ((v: unknown) => boolean)
  short?: string | undefined
  type?: T
  hint?: T extends 'boolean' ? never : string
  delim?: M extends true ? string : never
} & (M extends false ? { multiple?: false | undefined }
: M extends true ? { multiple: true }
: { multiple?: boolean })

/**
 * A set of {@link ConfigOptionMeta} fields, referenced by their longOption
 * string values.
 */
export type ConfigMetaSet<
  T extends ConfigType,
  M extends boolean = boolean,
> = {
  [longOption: string]: ConfigOptionMeta<T, M>
}

/**
 * Infer {@link ConfigSet} fields from a given {@link ConfigMetaSet}
 */
export type ConfigSetFromMetaSet<
  T extends ConfigType,
  M extends boolean,
  S extends ConfigMetaSet<T, M>,
> = {
  [longOption in keyof S]: ConfigOptionBase<T, M>
}

/**
 * Fields that can be set on a {@link ConfigOptionBase} or
 * {@link ConfigOptionMeta} based on whether or not the field is known to be
 * multiple.
 */
export type MultiType<M extends boolean> =
  M extends true ?
    {
      multiple: true
      delim?: string | undefined
    }
  : M extends false ?
    {
      multiple?: false | undefined
      delim?: undefined
    }
  : {
      multiple?: boolean | undefined
      delim?: string | undefined
    }

/**
 * A config field definition, in its full representation.
 */
export type ConfigOptionBase<
  T extends ConfigType,
  M extends boolean = boolean,
> = {
  type: T
  short?: string | undefined
  default?: ValidValue<T, M> | undefined
  description?: string
  hint?: T extends 'boolean' ? undefined : string | undefined
  validate?: (v: unknown) => v is ValidValue<T, M>
  validOptions?: T extends 'boolean' ? undefined
  : T extends 'string' ? readonly string[]
  : T extends 'number' ? readonly number[]
  : readonly number[] | readonly string[]
} & MultiType<M>

export const isConfigType = (t: string): t is ConfigType =>
  typeof t === 'string' &&
  (t === 'string' || t === 'number' || t === 'boolean')

const undefOrType = (v: unknown, t: string): boolean =>
  v === undefined || typeof v === t
const undefOrTypeArray = (v: unknown, t: string): boolean =>
  v === undefined || (Array.isArray(v) && v.every(x => typeof x === t))

const isValidOption = (v: unknown, vo: readonly unknown[]): boolean =>
  Array.isArray(v) ? v.every(x => isValidOption(x, vo)) : vo.includes(v)

// print the value type, for error message reporting
const valueType = (
  v:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | { type: ConfigType; multiple?: boolean },
): string =>
  typeof v === 'string' ? 'string'
  : typeof v === 'boolean' ? 'boolean'
  : typeof v === 'number' ? 'number'
  : Array.isArray(v) ?
    joinTypes([...new Set(v.map(v => valueType(v)))]) + '[]'
  : `${v.type}${v.multiple ? '[]' : ''}`

const joinTypes = (types: string[]): string =>
  types.length === 1 && typeof types[0] === 'string' ?
    types[0]
  : `(${types.join('|')})`

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

export const isConfigOption = <T extends ConfigType, M extends boolean>(
  o: any,
  type: T,
  multi: M,
): o is ConfigOptionBase<T, M> =>
  !!o &&
  typeof o === 'object' &&
  isConfigType(o.type) &&
  o.type === type &&
  undefOrType(o.short, 'string') &&
  undefOrType(o.description, 'string') &&
  undefOrType(o.hint, 'string') &&
  undefOrType(o.validate, 'function') &&
  (o.type === 'boolean' ?
    o.validOptions === undefined
  : undefOrTypeArray(o.validOptions, o.type)) &&
  (o.default === undefined || isValidValue(o.default, type, multi)) &&
  !!o.multiple === multi

/**
 * A set of {@link ConfigOptionBase} objects, referenced by their longOption
 * string values.
 */
export type ConfigSet = {
  [longOption: string]: ConfigOptionBase<ConfigType>
}

/**
 * The 'values' field returned by {@link Jack#parse}
 */
export type OptionsResults<T extends ConfigSet> = {
  [k in keyof T]?: T[k]['validOptions'] extends (
    readonly string[] | readonly number[]
  ) ?
    T[k] extends ConfigOptionBase<'string' | 'number', false> ?
      T[k]['validOptions'][number]
    : T[k] extends ConfigOptionBase<'string' | 'number', true> ?
      T[k]['validOptions'][number][]
    : never
  : T[k] extends ConfigOptionBase<'string', false> ? string
  : T[k] extends ConfigOptionBase<'string', true> ? string[]
  : T[k] extends ConfigOptionBase<'number', false> ? number
  : T[k] extends ConfigOptionBase<'number', true> ? number[]
  : T[k] extends ConfigOptionBase<'boolean', false> ? boolean
  : T[k] extends ConfigOptionBase<'boolean', true> ? boolean[]
  : never
}

/**
 * The object retured by {@link Jack#parse}
 */
export type Parsed<T extends ConfigSet> = {
  values: OptionsResults<T>
  positionals: string[]
}

function num(
  o: ConfigOptionMeta<'number', false> = {},
): ConfigOptionBase<'number', false> {
  const { default: def, validate: val, validOptions, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'number', false)) {
    throw new TypeError('invalid default value', {
      cause: {
        found: def,
        wanted: 'number',
      },
    })
  }
  if (!undefOrTypeArray(validOptions, 'number')) {
    throw new TypeError('invalid validOptions', {
      cause: {
        found: validOptions,
        wanted: 'number[]',
      },
    })
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'number', false>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    validOptions,
    type: 'number',
    multiple: false,
  }
}

function numList(
  o: ConfigOptionMeta<'number'> = {},
): ConfigOptionBase<'number', true> {
  const { default: def, validate: val, validOptions, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'number', true)) {
    throw new TypeError('invalid default value', {
      cause: {
        found: def,
        wanted: 'number[]',
      },
    })
  }
  if (!undefOrTypeArray(validOptions, 'number')) {
    throw new TypeError('invalid validOptions', {
      cause: {
        found: validOptions,
        wanted: 'number[]',
      },
    })
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'number', true>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    validOptions,
    type: 'number',
    multiple: true,
  }
}

function opt(
  o: ConfigOptionMeta<'string', false> = {},
): ConfigOptionBase<'string', false> {
  const { default: def, validate: val, validOptions, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'string', false)) {
    throw new TypeError('invalid default value', {
      cause: {
        found: def,
        wanted: 'string',
      },
    })
  }
  if (!undefOrTypeArray(validOptions, 'string')) {
    throw new TypeError('invalid validOptions', {
      cause: {
        found: validOptions,
        wanted: 'string[]',
      },
    })
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'string', false>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    validOptions,
    type: 'string',
    multiple: false,
  }
}

function optList(
  o: ConfigOptionMeta<'string'> = {},
): ConfigOptionBase<'string', true> {
  const { default: def, validate: val, validOptions, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'string', true)) {
    throw new TypeError('invalid default value', {
      cause: {
        found: def,
        wanted: 'string[]',
      },
    })
  }
  if (!undefOrTypeArray(validOptions, 'string')) {
    throw new TypeError('invalid validOptions', {
      cause: {
        found: validOptions,
        wanted: 'string[]',
      },
    })
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'string', true>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    validOptions,
    type: 'string',
    multiple: true,
  }
}

function flag(
  o: ConfigOptionMeta<'boolean', false> = {},
): ConfigOptionBase<'boolean', false> {
  const {
    hint,
    default: def,
    validate: val,
    ...rest
  } = o as ConfigOptionMeta<'boolean', false>
  delete (rest as ConfigOptionMeta<'string', false>).validOptions
  if (def !== undefined && !isValidValue(def, 'boolean', false)) {
    throw new TypeError('invalid default value')
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'boolean', false>)
    : undefined
  if (hint !== undefined) {
    throw new TypeError('cannot provide hint for flag')
  }
  return {
    ...rest,
    default: def,
    validate,
    type: 'boolean',
    multiple: false,
  }
}

function flagList(
  o: ConfigOptionMeta<'boolean'> = {},
): ConfigOptionBase<'boolean', true> {
  const {
    hint,
    default: def,
    validate: val,
    ...rest
  } = o as ConfigOptionMeta<'boolean', false>
  delete (rest as ConfigOptionMeta<'string', false>).validOptions
  if (def !== undefined && !isValidValue(def, 'boolean', true)) {
    throw new TypeError('invalid default value')
  }
  const validate =
    val ?
      (val as (v: unknown) => v is ValidValue<'boolean', true>)
    : undefined
  if (hint !== undefined) {
    throw new TypeError('cannot provide hint for flag list')
  }
  return {
    ...rest,
    default: def,
    validate,
    type: 'boolean',
    multiple: true,
  }
}
const toParseArgsOptionsConfig = (
  options: ConfigSet,
): Exclude<ParseArgsConfig['options'], undefined> => {
  const c: Exclude<ParseArgsConfig['options'], undefined> = {}
  for (const longOption in options) {
    const config = options[longOption]
    /* c8 ignore start */
    if (!config) {
      throw new Error('config must be an object: ' + longOption)
    }
    /* c8 ignore start */
    if (isConfigOption(config, 'number', true)) {
      c[longOption] = {
        type: 'string',
        multiple: true,
        default: config.default?.map(c => String(c)),
      }
    } else if (isConfigOption(config, 'number', false)) {
      c[longOption] = {
        type: 'string',
        multiple: false,
        default:
          config.default === undefined ?
            undefined
          : String(config.default),
      }
    } else {
      const conf = config as
        | ConfigOptionBase<'string'>
        | ConfigOptionBase<'boolean'>
      c[longOption] = {
        type: conf.type,
        multiple: !!conf.multiple,
        default: conf.default,
      }
    }
    const clo = c[longOption] as ConfigOptionBase<ConfigType>
    if (typeof config.short === 'string') {
      clo.short = config.short
    }

    if (
      config.type === 'boolean' &&
      !longOption.startsWith('no-') &&
      !options[`no-${longOption}`]
    ) {
      c[`no-${longOption}`] = {
        type: 'boolean',
        multiple: config.multiple,
      }
    }
  }
  return c
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
 * Either a {@link TextRow} or a reference to a {@link ConfigOptionBase}
 */
export type UsageField =
  | TextRow
  | {
      type: 'config'
      name: string
      value: ConfigOptionBase<ConfigType>
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
  env?: { [k: string]: string | undefined }

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
}

/**
 * Class returned by the {@link jack} function and all configuration
 * definition methods.  This is what gets chained together.
 */
export class Jack<C extends ConfigSet = {}> {
  #configSet: C
  #shorts: { [k: string]: string }
  #options: JackOptions
  #fields: UsageField[] = []
  #env: { [k: string]: string | undefined }
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
   * Set the default value (which will still be overridden by env or cli)
   * as if from a parsed config file. The optional `source` param, if
   * provided, will be included in error messages if a value is invalid or
   * unknown.
   */
  setConfigValues(values: OptionsResults<C>, source = '') {
    try {
      this.validate(values)
    } catch (er) {
      const e = er as Error
      if (source && e && typeof e === 'object') {
        if (e.cause && typeof e.cause === 'object') {
          Object.assign(e.cause, { path: source })
        } else {
          e.cause = { path: source }
        }
      }
      throw e
    }
    for (const [field, value] of Object.entries(values)) {
      const my = this.#configSet[field]
      // already validated, just for TS's benefit
      /* c8 ignore start */
      if (!my) {
        throw new Error('unexpected field in config set: ' + field, {
          cause: { found: field },
        })
      }
      /* c8 ignore stop */
      my.default = value
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
    if (args === process.argv) {
      args = args.slice(
        (process as { _eval?: string })._eval !== undefined ? 1 : 2,
      )
    }
    if (this.#envPrefix) {
      for (const [field, my] of Object.entries(this.#configSet)) {
        const ek = toEnvKey(this.#envPrefix, field)
        const env = this.#env[ek]
        if (env !== undefined) {
          my.default = fromEnvVal(env, my.type, !!my.multiple, my.delim)
        }
      }
    }

    const options = toParseArgsOptionsConfig(this.#configSet)
    const result = parseArgs({
      args,
      options,
      // always strict, but using our own logic
      strict: false,
      allowPositionals: this.#allowPositionals,
      tokens: true,
    })

    const p: Parsed<C> = {
      values: {},
      positionals: [],
    }
    for (const token of result.tokens) {
      if (token.kind === 'positional') {
        p.positionals.push(token.value)
        if (this.#options.stopAtPositional) {
          p.positionals.push(...args.slice(token.index + 1))
          break
        }
      } else if (token.kind === 'option') {
        let value: string | number | boolean | undefined = undefined
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
                { cause: { found: token } },
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
          const pv = p.values as {
            [k: string]: (string | number | boolean)[]
          }
          const tn = pv[token.name] ?? []
          pv[token.name] = tn
          tn.push(value)
        } else {
          const pv = p.values as { [k: string]: string | number | boolean }
          pv[token.name] = value
        }
      }
    }

    for (const [field, c] of Object.entries(this.#configSet)) {
      if (c.default !== undefined && !(field in p.values)) {
        //@ts-ignore
        p.values[field] = c.default
      }
    }

    for (const [field, value] of Object.entries(p.values)) {
      const valid = this.#configSet[field]?.validate
      const validOptions = this.#configSet[field]?.validOptions
      let cause:
        | undefined
        | {
            name: string
            found: unknown
            validOptions?: readonly string[] | readonly number[]
          }
      if (validOptions && !isValidOption(value, validOptions)) {
        cause = { name: field, found: value, validOptions: validOptions }
      }
      if (valid && !valid(value)) {
        cause ??= { name: field, found: value }
      }
      if (cause) {
        throw new Error(
          `Invalid value provided for --${field}: ${JSON.stringify(
            value,
          )}`,
          { cause },
        )
      }
    }

    this.#writeEnv(p)

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
        { cause: { found: s, wanted: yes } },
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
        cause: { found: o },
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
          cause: { found: field },
        })
      }
      if (!isValidValue(value, config.type, !!config.multiple)) {
        throw new Error(
          `Invalid value ${valueType(
            value,
          )} for ${field}, expected ${valueType(config)}`,
          {
            cause: {
              name: field,
              found: value,
              wanted: valueType(config),
            },
          },
        )
      }
      let cause:
        | undefined
        | {
            name: string
            found: any
            validOptions?: readonly string[] | readonly number[]
          }
      if (
        config.validOptions &&
        !isValidOption(value, config.validOptions)
      ) {
        cause = {
          name: field,
          found: value,
          validOptions: config.validOptions,
        }
      }
      if (config.validate && !config.validate(value)) {
        cause ??= { name: field, found: value }
      }
      if (cause) {
        throw new Error(`Invalid config value for ${field}: ${value}`, {
          cause,
        })
      }
    }
  }

  #writeEnv(p: Parsed<C>) {
    if (!this.#env || !this.#envPrefix) return
    for (const [field, value] of Object.entries(p.values)) {
      const my = this.#configSet[field]
      this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(
        value,
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
    return this.#addFields(fields, num)
  }

  /**
   * Add one or more multiple number fields.
   */
  numList<F extends ConfigMetaSet<'number'>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'number', true, F>> {
    return this.#addFields(fields, numList)
  }

  /**
   * Add one or more string option fields.
   */
  opt<F extends ConfigMetaSet<'string', false>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'string', false, F>> {
    return this.#addFields(fields, opt)
  }

  /**
   * Add one or more multiple string option fields.
   */
  optList<F extends ConfigMetaSet<'string'>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'string', true, F>> {
    return this.#addFields(fields, optList)
  }

  /**
   * Add one or more flag fields.
   */
  flag<F extends ConfigMetaSet<'boolean', false>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'boolean', false, F>> {
    return this.#addFields(fields, flag)
  }

  /**
   * Add one or more multiple flag fields.
   */
  flagList<F extends ConfigMetaSet<'boolean'>>(
    fields: F,
  ): Jack<C & ConfigSetFromMetaSet<'boolean', true, F>> {
    return this.#addFields(fields, flagList)
  }

  /**
   * Generic field definition method. Similar to flag/flagList/number/etc,
   * but you must specify the `type` (and optionally `multiple` and `delim`)
   * fields on each one, or Jack won't know how to define them.
   */
  addFields<F extends ConfigSet>(fields: F): Jack<C & F> {
    const next = this as unknown as Jack<C & F>
    for (const [name, field] of Object.entries(fields)) {
      this.#validateName(name, field)
      next.#fields.push({
        type: 'config',
        name,
        value: field as ConfigOptionBase<ConfigType>,
      })
    }
    Object.assign(next.#configSet, fields)
    return next
  }

  #addFields<
    T extends ConfigType,
    M extends boolean,
    F extends ConfigMetaSet<T, M>,
  >(
    fields: F,
    fn: (m: ConfigOptionMeta<T, M>) => ConfigOptionBase<T, M>,
  ): Jack<C & ConfigSetFromMetaSet<T, M, F>> {
    type NextC = C & ConfigSetFromMetaSet<T, M, F>
    const next = this as unknown as Jack<NextC>
    Object.assign(
      next.#configSet,
      Object.fromEntries(
        Object.entries(fields).map(([name, field]) => {
          this.#validateName(name, field)
          const option = fn(field)
          next.#fields.push({
            type: 'config',
            name,
            value: option as ConfigOptionBase<ConfigType>,
          })
          return [name, option]
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

// Unwrap and un-indent, so we can wrap description
// strings however makes them look nice in the code.
const normalize = (s: string, pre: boolean = false): string =>
  pre ?
    // prepend a ZWSP to each line so cliui doesn't strip it.
    s
      .split('\n')
      .map(l => `\u200b${l}`)
      .join('\n')
  : s
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

/**
 * Main entry point. Create and return a {@link Jack} object.
 */
export const jack = (options: JackOptions = {}) => new Jack(options)
