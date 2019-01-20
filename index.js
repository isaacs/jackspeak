'use strict'

// XXX required options?  or just attach a usage() method on result?

// XXX Also aliases don't have defaults and shouldn't show up in the
// results, so they feel like maybe a different kind of thing?

const assert = require('assert')
const cliui = require('cliui')
const path = require('path')

// only way to trigger is run as non-module, which can't be instrumented
/* istanbul ignore next */
const $0 = require.main ? path.basename(require.main.filename) : '$0'

const _flag = Symbol('flag')
const flag = options => ({
  [_env]: false,
  [_list]: false,
  ...(options || {}),
  [_num]: false,
  [_opt]: false,
  [_flag]: true
})
const isFlag = arg => arg[_flag]

const _opt = Symbol('opt')
const opt = options => ({
  [_num]: false,
  [_list]: false,
  [_env]: false,
  ...(options || {}),
  [_flag]: false,
  [_opt]: true
})
const isOpt = arg => arg[_opt]

const _num = Symbol('num')
const num = options => (opt({
  ...(options || {}),
  [_num]: true,
}))
const isNum = arg => arg[_num]

const isArg = arg => isOpt(arg) || isFlag(arg)

const _env = Symbol('env')
const env = options => ({
  [_flag]: false,
  [_list]: false,
  [_opt]: true,
  [_num]: false,
  ...(options || {}),
  [_env]: true,
})
const isEnv = arg => arg[_env]

const _list = Symbol('list')
const list = options => ({
  [_flag]: false,
  [_opt]: true,
  [_num]: false,
  [_env]: false,
  ...(options || {}),
  [_list]: true
})
const isList = arg => arg[_list]

const count = options => list(flag(options))
const isCount = arg => isList(arg) && isFlag(arg)

const trim = string => string
  // remove single line breaks
  .replace(/([^\n])\n[ \t]*([^\n])/g, '$1 $2')
  // normalize mid-line whitespace
  .replace(/([^\n])[ \t]+([^\n])/g, '$1 $2')
  // two line breaks are enough
  .replace(/\n{3,}/g, '\n\n')
  .trim()

const usageMemo = Symbol('usageMemo')
const usage = j => {
  if (j[usageMemo])
    return j[usageMemo]

  const ui = cliui()

  if (!/^Usage:/.test(j.help[0].text)) {
    ui.div('Usage:')
    ui.div({
      text: `${$0} <options>`,
      padding: [0, 0, 1, 2]
    })
  }

  let maxWidth = 0
  j.help.forEach(row => {
    if (row.left)
      maxWidth = Math.min(30, Math.max(row.left.length + 4, maxWidth))
  })

  j.help.forEach(row => {
    if (row.left) {
      ui.div({
        text: row.left,
        padding: [0, 2, 0, 2],
        width: maxWidth,
      }, { text: row.text })
      ui.div()
    } else
      ui.div(row)
  })

  return j[usageMemo] = ui.toString()
}

// parse each section
// Resulting internal object looks like:
// {
//   help: [
//     { text, padding, left }, ...
//   ],
//   // single-char shorthands
//   shortOpts: { char: name, ... }
//   shortFlags: { char: name, ... }
//   options: { all opts and flags }
//   main: mainFn or null,
//   argv: argument list being parsed,
//   result: parsed object passed to main function and returned
// }
const jack = (...sections) => execute(parse_(buildParser({
    help: [],
    shortOpts: {},
    shortFlags: {},
    options: {},
    result: { _: [] },
    main: null,
    argv: null,
    env: null,
    [usageMemo]: false,
  }, sections)))

const execute = j => {
  if (j.result.help)
    console.log(usage(j))
  else if (j.main)
    j.main(j.result)
  return j.result
}

const buildParser = (j, sections) => {
  sections.forEach(section => {
    if (Array.isArray(section))
      section = { argv: section }
    if (section.argv && !isArg(section.argv)) {
      !j.argv || assert(false, 'argv specified multiple times')
      j.argv = section.argv
    }

    if (section.env && !isArg(section.env)) {
      !j.env || assert(false, 'env specified multiple times\n' +
             '(did you set it after defining some environment args?)')
      j.env = section.env
    }

    if (section.usage && !isArg(section.usage)) {
      const val = section.usage
      typeof val === 'string' || Array.isArray(val) || assert(false,
             'usage must be a string or array')
      j.help.push({ text: 'Usage:' })
      j.help.push.apply(j.help, [].concat(val).map(text => ({
        text, padding: [0, 0, 0, 2]
      })))
      j.help.push({ text: '' })
    }

    if (section.description && !isArg(section.description)) {
      typeof section.description === 'string' || assert(false,
             'description must be string')
      j.help.push({
        text: trim(`${section.description}:`),
        padding: [0, 0, 1, 0]
      })
    }

    if (section.help && !isArg(section.help)) {
      typeof section.help === 'string' || assert(false, 'help must be a string')
      j.help.push({ text: trim(section.help) + '\n' })
    }

    if (section.main && !isArg(section.main))
      addMain(j, section.main)

    !section._ || assert(false, '_ is reserved for positional arguments')

    const names = Object.keys(section)
    for (let n = 0; n < names.length; n++) {
      const name = names[n]
      const val = section[name]

      if (isEnv(val))
        addEnv(j, name, val)
      else if (isArg(val))
        addArg(j, name, val)
      else {
        switch (name) {
          case 'argv':
          case 'description':
          case 'usage':
          case 'help':
          case 'main':
          case 'env':
            continue
          default:
            assert(false, `${name} not flag, opt, or env`)
        }
      }
    }
  })

  // if not already mentioned, add the note about -h and `--` ending parsing
  if (!j.options.help)
    addArg(j, 'help', flag({ description: 'Show this helpful output' }))

  if (!j.options['--']) {
    addHelpText(j, '', flag({
      description: `Stop parsing flags and options, treat any additional
                    command line arguments as positional arguments.`
    }))
  }

  return j
}

const envToNum = (name, spec) => e => {
  if (e === '')
    return undefined

  return toNum(e, `environment variable ${name}`, spec)
}

const envToBool = name => e => {
  e === '' || e === '1' || e === '0' || typeof e === 'number' || assert(false,
    `Environment variable ${name} must be set to 0 or 1 only`)
  return e === '' ? false : !!+e
}

const countBools = l => l.reduce((v, a) => v ? a + 1 : a - 1, 0)

const addEnv = (j, name, val) => {
  assertNotDefined(j, name)
  if (!j.env)
    j.env = process.env

  const def = val.default
  const has = Object.prototype.hasOwnProperty.call(j.env, name)
  const e = has && j.env[name] !== '' ? j.env[name]
    : def !== undefined ? def
    : ''

  if (isList(val)) {
    val.delimiter || assert(false, `env list ${name} lacks delimiter`)
    if (!has)
      j.result[name] = []
    else {
      const split = e.split(val.delimiter)
      j.result[name] = isFlag(val) ? countBools(split.map(envToBool(name)))
        : isNum(val) ? split.map(envToNum(name, val)).filter(e => e !== undefined)
        : split
    }
  } else if (isFlag(val))
    j.result[name] = envToBool(name)(e)
  else if (isNum(val))
    j.result[name] = envToNum(name, val)(e)
  else
    j.result[name] = e

  addHelpText(j, name, val)
}

const assertNotDefined = (j, name) =>
  !j.options[name] && !j.shortOpts[name] && !j.shortFlags[name] ||
    assert(false, `${name} defined multiple times`)

const addArg = (j, name, val) => {
  assertNotDefined(j, name)
  if (isFlag(val))
    addFlag(j, name, val)
  else
    addOpt(j, name, val)
}

const addOpt = (j, name, val) => {
  addShort(j, name, val)
  j.options[name] = val
  addHelpText(j, name, val)
  if (!val.alias)
    j.result[name] = isList(val) ? [] : val.default
}

const addFlag = (j, name, val) => {
  if (name === '--') {
    addHelpText(j, '', flag(val))
    j.options['--'] = true
    return
  }

  if (name === 'help' && !val.short)
    val.short = 'h'

  const negate = name.substr(0, 3) === 'no-'
  // aliases can't be negated
  if (!negate && !val.alias)
    !j.options[`no-${name}`] || assert(false,
      `flag '${name}' specified, but 'no-${name}' already defined`)

  addShort(j, name, val)

  j.options[name] = val
  if (!negate && !val.alias)
    j.result[name] = isList(val) ? 0 : (val.default || false)

  addHelpText(j, name, val)

  // pick up the description and short arg
  if (!negate && !val.alias)
    addFlag(j, `no-${name}`, flag({
      description: `${
        isCount(val) ? 'decrement' : 'switch off'
      } the --${name} flag`,
      hidden: val.hidden,
      ...(val.negate || {}),
      [_list]: isList(val)
    }))
}

const addHelpText = (j, name, val) => {
  // help text
  if (val.hidden)
    return

  const desc = trim(val.description || (
    val.alias ? `Alias for ${[].concat(val.alias).join(' ')}`
    : '[no description provided]'
  ))
  const mult = isList(val) ? `${
    desc.indexOf('\n') === -1 ? '\n' : '\n\n'
  }Can be set multiple times` : ''
  const text = `${desc}${mult}`

  const hint = val.hint || name
  const short = val.short ? (
    isFlag(val) ? `, -${val.short}`
    : `, -${val.short}<${hint}>`
  ) : ''

  const left = isEnv(val) ? name
    : isFlag(val) ? `--${name}${short}`
    : `--${name}=<${hint}>${short}`

  j.help.push({ text, left })
}

const addShort = (j, name, val) => {
  if (!val.short)
    return

  assertNotDefined(j, val.short)
  val.short !== 'h' || name === 'help' || assert(false,
    `${name} using 'h' short val, reserved for --help`)

  if (isFlag(val))
    j.shortFlags[val.short] = name
  else
    j.shortOpts[val.short] = name
}

const addMain = (j, main) => {
  typeof main === 'function' || assert(false, 'main must be function')
  !j.main || assert(false, 'main function specified multiple times')
  j.main = result => {
    main(result)
    return result
  }
}

const getArgv = j => {
  const argv = [...(j.argv || process.argv)]

  if (argv[0] === process.execPath) {
    argv.shift()
    if (argv[0] === require.main.filename)
      argv.shift()
  }
  return argv
}

const toNum = (val, key, spec) => {
  !isNaN(val) || assert(false, `non-number '${val}' given for numeric ${key}`)
  val = +val
  isNaN(spec.max) || val <= spec.max || assert(false,
         `value ${val} for ${key} exceeds max (${spec.max})`)
  isNaN(spec.min) || val >= spec.min || assert(false,
         `value ${val} for ${key} below min (${spec.min})`)
  return val
}

const parse_ = j => {
  const argv = getArgv(j)

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg.charAt(0) !== '-' || arg === '-') {
      j.result._.push(arg)
      continue
    }

    if (arg === '--') {
      j.result._ = j.result._.concat(argv.slice(i + 1))
      i = argv.length
      continue
    }

    // short-flags
    if (arg.charAt(1) !== '-') {
      const expand = []
      for (let f = 1; f < arg.length; f++) {
        const fc = arg.charAt(f)
        const sf = j.shortFlags[fc]
        const so = j.shortOpts[fc]
        if (sf)
          expand.push(`--${sf}`)
        else if (so) {
          const soslice = arg.slice(f + 1)
          const soval = !soslice || soslice.charAt(0) === '='
            ? soslice : '=' + soslice

          expand.push(`--${so}${soval}`)
          f = arg.length
        } else if (arg !== `-${fc}`)
          // this will trigger a failure with the appropriate message
          expand.push(`-${fc}`)
      }
      if (expand.length) {
        argv.splice.apply(argv, [i, 1].concat(expand))
        i--
        continue
      }
    }

    const argsplit = arg.split('=')
    const literalKey = argsplit.shift()

    // check if there's a >1 char shortopt/flag for this key,
    // and de-reference it as an alias

    const k = literalKey.replace(/^--?/, '')
    // pick up shorts that aren't single-char
    const key = j.shortOpts[k] || j.shortFlags[k] || k
    let val = argsplit.length ? argsplit.join('=') : null

    const spec = j.options[key]

    spec || assert(false, `invalid argument: ${literalKey}`)
    !isFlag(spec) || val === null || assert(false,
      `value provided for boolean flag: ${key}`)

    if (isOpt(spec) && val === null) {
      val = argv[++i]
      val !== undefined || assert(false,
        `no value provided for option: ${key}`)
    }

    if (spec.alias) {
      const alias = isFlag(spec) ? spec.alias
      : [].concat(spec.alias).map(a => a.replace(/\$\{value\}/g, val))
      argv.splice.apply(argv, [i, 1].concat(alias))
      i--
      continue
    }

    const negate = isFlag(spec) && key.substr(0, 3) === 'no-'
    const name = negate ? key.substr(3) : key
    if (isNum(spec))
      val = toNum(val, `arg ${literalKey}`, spec)

    if (isList(spec)) {
      if (isOpt(spec)) {
        j.result[name].push(val)
      } else {
        j.result[name] = j.result[name] || 0
        if (negate)
          j.result[name]--
        else
          j.result[name]++
      }
    } else {
      // either flag or opt
      j.result[name] = isFlag(spec) ? !negate : val
    }
  }

  Object.defineProperty(j.result._, 'usage', {
    value: () => console.log(usage(j))
  })
  Object.defineProperty(j.result._, 'parsed', { value: argv })

  return j
}

// just parse the arguments and return the result
const parse = (...sections) => parse_(buildParser({
  help: [],
  shortOpts: {},
  shortFlags: {},
  options: {},
  result: { _: [] },
  main: null,
  argv: null,
  env: null,
  [usageMemo]: false,
}, sections)).result

module.exports = { jack, flag, opt, list, count, env, parse, num }
