export type ConfigType = 'number' | 'string' | 'boolean'

import { inspect, InspectOptions, ParseArgsConfig } from 'node:util'
import { parseArgs } from './parse-args.js'

// it's a tiny API, just cast it inline, it's fine
//@ts-ignore
import _cliui from 'cliui'
import { basename } from 'node:path'

interface CliUI {
  div(
    ...p: {
      text: string
      padding?: [number, number, number, number]
      width?: number
    }[]
  ): void
  toString(): string
}
const cliui = (o: { width?: number } = {}): CliUI => _cliui(o)

const width = Math.min(
  (process && process.stdout && process.stdout.columns) || 80,
  80
)

const toEnvKey = (pref: string, key: string): string => {
  return [pref, key.replace(/[^a-zA-Z0-9]+/g, ' ')]
    .join(' ')
    .trim()
    .toUpperCase()
    .replace(/ /g, '_')
}

const toEnvVal = (
  value: string | boolean | number | string[] | boolean[] | number[],
  delim: string = '\n'
): string => {
  const str =
    typeof value === 'string'
      ? value
      : typeof value === 'boolean'
      ? value
        ? '1'
        : '0'
      : typeof value === 'number'
      ? String(value)
      : Array.isArray(value)
      ? value
          .map((v: string | number | boolean) => toEnvVal(v))
          .join(delim)
      : /* c8 ignore start */
        undefined
  if (typeof str !== 'string') {
    throw new Error(
      `could not serialize value to environment: ${JSON.stringify(value)}`
    )
  }
  /* c8 ignore stop */
  return str
}

const fromEnvVal = <T extends ConfigType, M extends boolean>(
  env: string,
  type: T,
  multiple: M,
  delim: string = '\n'
): ValidValue<T, M> =>
  (multiple
    ? env.split(delim).map(v => fromEnvVal(v, type, false))
    : type === 'string'
    ? env
    : type === 'boolean'
    ? env === '1'
    : +env.trim()) as ValidValue<T, M>

type ValidValue<T extends ConfigType, M extends boolean> = [T, M] extends [
  'number',
  true
]
  ? number[]
  : [T, M] extends ['string', true]
  ? string[]
  : [T, M] extends ['boolean', true]
  ? boolean[]
  : [T, M] extends ['number', false]
  ? number
  : [T, M] extends ['string', false]
  ? string
  : [T, M] extends ['boolean', false]
  ? boolean
  : [T, M] extends ['string', boolean]
  ? string | string[]
  : [T, M] extends ['boolean', boolean]
  ? boolean | boolean[]
  : [T, M] extends ['number', boolean]
  ? number | number[]
  : [T, M] extends [ConfigType, false]
  ? string | number | boolean
  : [T, M] extends [ConfigType, true]
  ? string[] | number[] | boolean[]
  : string | number | boolean | string[] | number[] | boolean[]

export type ConfigOptionMeta<T extends ConfigType, M extends boolean> = {
  default?: ValidValue<T, M> | undefined
  description?: string
  validate?: ((v: any) => v is ValidValue<T, M>) | ((v: any) => boolean)
  short?: string | undefined
  type?: T
} & (T extends 'boolean' ? {} : { hint?: string | undefined }) &
  (M extends false
    ? {}
    : { multiple?: M | undefined; delim?: string | undefined })

export type ConfigMetaSet<T extends ConfigType, M extends boolean> = {
  [longOption: string]: ConfigOptionMeta<T, M>
}

type ConfigSetFromMetaSet<
  T extends ConfigType,
  M extends boolean,
  S extends ConfigMetaSet<T, M>
> = {
  [longOption in keyof S]: ConfigOptionBase<T, M>
}

type MultiType<M extends boolean> = M extends true
  ? {
      multiple: true
      delim?: string | undefined
    }
  : M extends false
  ? {
      multiple?: false | undefined
      delim?: undefined
    }
  : {
      multiple?: boolean | undefined
      delim?: string | undefined
    }

type ConfigOptionBase<T extends ConfigType, M extends boolean> = {
  type: T
  short?: string | undefined
  default?: ValidValue<T, M> | undefined
  description?: string
  hint?: T extends 'boolean' ? undefined : string | undefined
  validate?: (v: any) => v is ValidValue<T, M>
} & MultiType<M>

const isConfigType = (t: string): t is ConfigType =>
  typeof t === 'string' &&
  (t === 'string' || t === 'number' || t === 'boolean')

const undefOrType = (v: any, t: string): boolean =>
  v === undefined || typeof v === t

const isValidValue = <T extends ConfigType, M extends boolean>(
  v: any,
  type: T,
  multi: M
): v is ValidValue<T, M> => {
  if (multi) {
    if (!Array.isArray(v)) return false
    return !v.some((v: any) => !isValidValue(v, type, false))
  }
  if (Array.isArray(v)) return false
  return typeof v === type
}

const isConfigOption = <T extends ConfigType, M extends boolean>(
  o: any,
  type: T,
  multi: M
): o is ConfigOptionBase<T, M> =>
  !!o &&
  typeof o === 'object' &&
  isConfigType(o.type) &&
  o.type === type &&
  undefOrType(o.short, 'string') &&
  undefOrType(o.description, 'string') &&
  undefOrType(o.hint, 'string') &&
  undefOrType(o.validate, 'function') &&
  (o.default === undefined || isValidValue(o.default, type, multi)) &&
  !!o.multiple === multi

type ConfigSet = {
  [longOption: string]: ConfigOptionBase<ConfigType, boolean>
}

type OptionsResults<T extends ConfigSet> = {
  [k in keyof T]?: T[k] extends ConfigOptionBase<'string', false>
    ? string
    : T[k] extends ConfigOptionBase<'string', true>
    ? string[]
    : T[k] extends ConfigOptionBase<'number', false>
    ? number
    : T[k] extends ConfigOptionBase<'number', true>
    ? number[]
    : T[k] extends ConfigOptionBase<'boolean', false>
    ? boolean
    : T[k] extends ConfigOptionBase<'boolean', true>
    ? boolean[]
    : never
}

type Parsed<T extends ConfigSet> = {
  values: OptionsResults<T>
  positionals: string[]
}

function num(
  o: ConfigOptionMeta<'number', false> = {}
): ConfigOptionBase<'number', false> {
  const { default: def, validate: val, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'number', false)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'number', false>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    type: 'number',
    multiple: false,
  }
}

function numList(
  o: ConfigOptionMeta<'number', true> = {}
): ConfigOptionBase<'number', true> {
  const { default: def, validate: val, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'number', true)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'number', true>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    type: 'number',
    multiple: true,
  }
}

function opt(
  o: ConfigOptionMeta<'string', false> = {}
): ConfigOptionBase<'string', false> {
  const { default: def, validate: val, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'string', false)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'string', false>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    type: 'string',
    multiple: false,
  }
}

function optList(
  o: ConfigOptionMeta<'string', true> = {}
): ConfigOptionBase<'string', true> {
  const { default: def, validate: val, ...rest } = o
  if (def !== undefined && !isValidValue(def, 'string', true)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'string', true>)
    : undefined
  return {
    ...rest,
    default: def,
    validate,
    type: 'string',
    multiple: true,
  }
}

function flag(
  o: ConfigOptionMeta<'boolean', false> = {}
): ConfigOptionBase<'boolean', false> {
  const {
    hint,
    default: def,
    validate: val,
    ...rest
  } = o as ConfigOptionMeta<'boolean', false> & { hint: any }
  if (def !== undefined && !isValidValue(def, 'boolean', false)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'boolean', false>)
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
  o: ConfigOptionMeta<'boolean', true> = {}
): ConfigOptionBase<'boolean', true> {
  const {
    hint,
    default: def,
    validate: val,
    ...rest
  } = o as ConfigOptionMeta<'boolean', false> & { hint: any }
  if (def !== undefined && !isValidValue(def, 'boolean', true)) {
    throw new TypeError('invalid default value')
  }
  const validate = val
    ? (val as (v: any) => v is ValidValue<'boolean', true>)
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
  options: ConfigSet
): Exclude<ParseArgsConfig['options'], undefined> => {
  const c: Exclude<ParseArgsConfig['options'], undefined> = {}
  for (const longOption in options) {
    const config = options[longOption]
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
          config.default === undefined
            ? undefined
            : String(config.default),
      }
    } else {
      const conf = config as
        | ConfigOptionBase<'string', boolean>
        | ConfigOptionBase<'boolean', boolean>
      c[longOption] = {
        type: conf.type,
        multiple: conf.multiple,
        default: conf.default,
      }
    }
    if (typeof config.short === 'string') {
      c[longOption].short = config.short
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

interface Row {
  left?: string
  text: string
  skipLine?: boolean
  type?: string
}
interface TextRow {
  type: 'heading' | 'description'
  text: string
  left?: ''
  skipLine?: boolean
}
type UsageField =
  | TextRow
  | {
      type: 'config'
      name: string
      value: ConfigOptionBase<ConfigType, boolean>
    }

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

export class Jack<C extends ConfigSet = {}> {
  #configSet: C
  #shorts: { [k: string]: string }
  #options: JackOptions
  #fields: UsageField[] = []
  #env: { [k: string]: string | undefined }
  #envPrefix?: string
  #allowPositionals: boolean
  #usage?: string

  constructor(options: JackOptions = {}) {
    this.#options = options
    this.#allowPositionals = options.allowPositionals !== false
    this.#env =
      this.#options.env === undefined ? process.env : this.#options.env
    this.#envPrefix = options.envPrefix
    // We need to fib a little, because it's always the same object, but it
    // starts out as having an empty config set.  Then each method that adds
    // fields returns `new Jack<C & { ...newConfigs }>()`
    this.#configSet = Object.create(null) as C
    this.#shorts = Object.create(null)
  }

  parse(args: string[] = process.argv): Parsed<C> {
    if (args === process.argv) {
      args = args.slice(
        (process as { _eval?: string })._eval !== undefined ? 1 : 2
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
          return p
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
              `'-- ${token.rawName}'`
          )
        }
        if (value === undefined) {
          if (token.value === undefined) {
            if (my.type !== 'boolean') {
              throw new Error(
                `No value provided for ${token.rawName}, expected ${my.type}`
              )
            }
            value = true
          } else {
            if (my.type === 'boolean') {
              throw new Error(
                `Flag ${token.rawName} does not take a value, received '${token.value}'`
              )
            }
            if (my.type === 'string') {
              value = token.value
            } else {
              value = +token.value
              if (value !== value) {
                throw new Error(
                  `Invalid value '${token.value}' provided for ` +
                    `'${token.rawName}' option, expected number`
                )
              }
            }
          }
        }
        if (my.multiple) {
          const pv = p.values as {
            [k: string]: (string | number | boolean)[]
          }
          pv[token.name] = pv[token.name] ?? []
          pv[token.name].push(value)
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
      const valid = this.#configSet[field].validate
      if (valid && !valid(value)) {
        throw new Error(
          `Invalid value provided for --${field}: ${JSON.stringify(value)}`
        )
      }
    }

    this.#writeEnv(p)

    return p
  }

  validate(o: any): asserts o is Parsed<C>['values'] {
    if (!o || typeof o !== 'object') {
      throw new Error('Invalid config: not an object')
    }
    for (const field in o) {
      const config = this.#configSet[field]
      if (!config) {
        throw new Error(`Unknown config option: ${field}`)
      }
      if (!isValidValue(o[field], config.type, !!config.multiple)) {
        throw new Error(
          `Invalid type for ${field} option, expected` +
            `${config.type}${config.multiple ? '[]' : ''}`
        )
      }
      if (config.validate && !config.validate(o[field])) {
        throw new Error(`Invalid config value for ${field}: ${o[field]}`)
      }
    }
  }

  #writeEnv(p: Parsed<C>) {
    if (!this.#env || !this.#envPrefix) return
    for (const [field, value] of Object.entries(p.values)) {
      const my = this.#configSet[field]
      this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(
        value,
        my.delim
      )
    }
  }

  heading(text: string): Jack<C> {
    this.#fields.push({ type: 'heading', text })
    return this
  }

  /**
   * Add a long-form description to the usage output at this position.
   */
  description(text: string): Jack<C> {
    this.#fields.push({ type: 'description', text })
    return this
  }

  /**
   * Add one or more number fields.
   */
  num<F extends ConfigMetaSet<'number', false>>(
    fields: F
  ): Jack<C & ConfigSetFromMetaSet<'number', false, F>> {
    return this.#addFields(fields, num)
  }

  /**
   * Add one or more multiple number fields.
   */
  numList<F extends ConfigMetaSet<'number', true>>(
    fields: F
  ): Jack<C & ConfigSetFromMetaSet<'number', true, F>> {
    return this.#addFields(fields, numList)
  }

  /**
   * Add one or more string option fields.
   */
  opt<F extends ConfigMetaSet<'string', false>>(
    fields: F
  ): Jack<C & ConfigSetFromMetaSet<'string', false, F>> {
    return this.#addFields(fields, opt)
  }

  /**
   * Add one or more multiple string option fields.
   */
  optList<F extends ConfigMetaSet<'string', true>>(
    fields: F
  ): Jack<C & ConfigSetFromMetaSet<'string', true, F>> {
    return this.#addFields(fields, optList)
  }

  /**
   * Add one or more flag fields.
   */
  flag<F extends ConfigMetaSet<'boolean', false>>(
    fields: F
  ): Jack<C & ConfigSetFromMetaSet<'boolean', false, F>> {
    return this.#addFields(fields, flag)
  }

  /**
   * Add one or more multiple flag fields.
   */
  flagList<F extends ConfigMetaSet<'boolean', true>>(
    fields: F
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
        value: field as ConfigOptionBase<ConfigType, boolean>,
      })
    }
    Object.assign(next.#configSet, fields)
    return next
  }

  #addFields<
    T extends ConfigType,
    M extends boolean,
    F extends ConfigMetaSet<T, M>
  >(
    fields: F,
    fn: (m: ConfigOptionMeta<T, M>) => ConfigOptionBase<T, M>
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
            value: option as ConfigOptionBase<ConfigType, boolean>,
          })
          return [name, option]
        })
      )
    )
    return next
  }

  #validateName(name: string, field: { short?: string }) {
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(name)) {
      throw new TypeError(
        `Invalid option name: ${name}, ` +
          `must be '-' delimited ASCII alphanumeric`
      )
    }
    if (this.#configSet[name]) {
      throw new TypeError(`Cannot redefine option ${field}`)
    }
    if (this.#shorts[name]) {
      throw new TypeError(
        `Cannot redefine option ${name}, already ` +
          `in use for ${this.#shorts[name]}`
      )
    }
    if (field.short) {
      if (!/^[a-zA-Z0-9]$/.test(field.short)) {
        throw new TypeError(
          `Invalid ${name} short option: ${field.short}, ` +
            'must be 1 ASCII alphanumeric character'
        )
      }
      if (this.#shorts[field.short]) {
        throw new TypeError(
          `Invalid ${name} short option: ${field.short}, ` +
            `already in use for ${this.#shorts[field.short]}`
        )
      }
      this.#shorts[field.short] = name
      this.#shorts[name] = name
    }
  }

  usage(): string {
    if (this.#usage) return this.#usage
    const ui = cliui({ width })
    let start = this.#fields[0]?.type === 'heading' ? 1 : 0
    if (this.#fields[0]?.type === 'heading') {
      ui.div({ text: normalize(this.#fields[0].text) })
    }
    ui.div({ text: 'Usage:' })
    if (this.#options.usage) {
      ui.div({
        text: this.#options.usage,
        padding: [0, 0, 0, 2],
      })
    } else {
      const cmd = basename(process.argv[1])
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
    ui.div({ text: '' })
    const maybeDesc = this.#fields[start]
    if (maybeDesc?.type === 'description') {
      start++
      ui.div({
        text: normalize(maybeDesc.text),
      })
      ui.div({ text: '' })
    }

    // turn each config type into a row, and figure out the width of the
    // left hand indentation for the option descriptions.
    let maxMax = Math.max(12, Math.min(26, Math.floor(width / 3)))
    let maxWidth = 8
    let prev: Row | TextRow | undefined = undefined
    const rows: (Row | TextRow)[] = []
    for (const field of this.#fields.slice(start)) {
      if (field.type !== 'config') {
        if (prev) prev.skipLine = true
        prev = undefined
        field.text = normalize(field.text)
        rows.push(field)
        continue
      }
      const { value } = field
      const desc = value.description || ''
      const mult = value.multiple ? 'Can be set multiple times' : ''
      const dmDelim = mult && (desc.includes('\n') ? '\n\n' : '\n')
      const text = normalize(desc + dmDelim + mult)
      const hint =
        value.hint ||
        (value.type === 'number'
          ? 'n'
          : value.type === 'string'
          ? field.name
          : undefined)
      const short = !value.short
        ? ''
        : value.type === 'boolean'
        ? `-${value.short} `
        : `-${value.short}<${hint}> `
      const left =
        value.type === 'boolean'
          ? `${short}--${field.name}`
          : `${short}--${field.name}=<${hint}>`
      const row: Row = { text, left }
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

    for (const row of rows) {
      if (row.left) {
        // If the row is too long, don't wrap it
        // Bump the right-hand side down a line to make room
        if (row.left.length > maxWidth - 2) {
          ui.div({ text: row.left, padding: [0, 0, 0, 2] })
          ui.div({ text: row.text, padding: [0, 0, 0, maxWidth] })
        } else {
          ui.div(
            {
              text: row.left,
              padding: [0, 1, 0, 2],
              width: maxWidth,
            },
            { text: row.text }
          )
        }
        if (row.skipLine) {
          ui.div({ text: '' })
        }
      } else {
        if (row.type === 'heading') {
          ui.div(row)
        } else {
          ui.div({ ...row, padding: [1, 0, 1, 2] })
        }
        ui.div()
      }
    }

    return (this.#usage = ui.toString())
  }

  toJSON() {
    return Object.fromEntries(
      Object.entries(this.#configSet).map(([field, def]) => [
        field,
        {
          type: def.type,
          ...(def.multiple ? { multiple: true } : {}),
          ...(def.delim ? { delim: def.delim } : {}),
          ...(def.short ? { short: def.short } : {}),
          ...(def.description ? { description: def.description } : {}),
          ...(def.validate ? { validate: def.validate } : {}),
          ...(def.default !== undefined ? { default: def.default } : {}),
        },
      ])
    )
  }

  [inspect.custom](_: number, options: InspectOptions) {
    return `Jack ${inspect(this.toJSON(), options)}`
  }
}

// Unwrap and un-indent, so we can wrap description
// strings however makes them look nice in the code.
const normalize = (s: string): string =>
  s
    // remove single line breaks
    .replace(/([^\n])\n[ \t]*([^\n])/g, '$1 $2')
    // normalize mid-line whitespace
    .replace(/([^\n])[ \t]+([^\n])/g, '$1 $2')
    // two line breaks are enough
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export const jack = (options: JackOptions = {}) => new Jack(options)
