'use strict'

// XXX help and usage output

// XXX required options?  or just attach a usage() method on result?

// XXX Also aliases don't have defaults and shouldn't show up in the
// results, so they feel like maybe a different kind of thing?

const assert = require('assert')

const _flag = Symbol('flag')
const _list = Symbol('list')
const _opt = Symbol('opt')

const flag = options => ({
  ...(options || {}),
  [_opt]: false,
  [_flag]: true
})

const opt = options => ({
  ...(options || {}),
  [_flag]: false,
  [_opt]: true
})

const list = options => ({
  [_flag]: false,
  [_opt]: true,
  ...(options || {}),
  [_list]: true
})

const count = options => list(flag(options))

const jack = options_ => {
  // don't monkey with the originals
  const options = { ...options_ }

  // validate the options
  const opts = {}
  const flags = {}
  const short = {}
  const shortFlags = {}
  const shortOpts = {}
  const result = { _ : [] }

  const names = Object.keys(options)
  for (let n = 0; n < names.length; n++) {
    const name = names[n]
    switch (name) {
      case 'main':
        assert(typeof options[name] === 'function',
               `${name} should be a function, if specified`)
        continue

      case '_':
        assert(false, '_ is reserved for positional arguments')

      case 'argv':
        assert(Array.isArray(options[name]),
               `${name} should be the array of arguments, if specified`)
        continue

      case 'usage':
      case 'help':
        assert(typeof options[name] === 'string',
               `${name} should be a string, not an argument type`)
        continue

      default: // ok it's an argument type!
        const arg = options[name]
        assert(arg[_flag] || arg[_opt], `${name} neither flag nor opt`)
        if (arg[_flag]) {
          if (name.substr(0, 3) !== 'no-') {
            assert(!options[`no-${name}`],
            `flag '${name}' specified, but 'no-${name}' already defined`)
            // just to pick up the description and short arg
            options[`no-${name}`] = flag({
              ...(arg.negate || {}),
              [_list]: arg[_list]
            })
            names.push(`no-${name}`)
          }
        }
        if (arg.short) {
          assert(arg.short.length === 1,
          `${name} short alias must be 1 char, found '${arg.short}'`)
          assert(!short[arg.short],
          `short ${arg.short} used for ${name} and ${short[arg.short]}`)
          short[arg.short] = name
          if (arg[_flag])
            shortFlags[arg.short] = name
          else
            shortOpts[arg.short] = name
        }
        if (arg[_flag]) {
          flags[name] = arg
        } else {
          opts[name] = arg
        }

        if (!arg.alias && (!arg[_flag] || name.slice(0, 3) !== 'no-')) {
          result[name] = arg[_list] ? (
            arg[_flag] ? 0 : []
          ) : arg[_flag] ? arg.default || false
            : arg.default
        }
        continue
    }
  }

  // start the parsing
  const args = [...(options.argv || process.argv)]

  if (args[0] === process.execPath) {
    args.shift()
    if (args[0] === require.main.filename)
      args.shift()
  }

  // the positional args passed on at the end
  const argv = result._ = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.charAt(0) !== '-' || arg === '-') {
      result._.push(arg)
      continue
    }

    if (arg === '--') {
      result._ = result._.concat(args.slice(i + 1))
      i = args.length
      continue
    }

    // short-flags
    if (arg.charAt(1) !== '-') {
      const expand = []
      for (let f = 1; f < arg.length; f++) {
        const fc = arg.charAt(f)
        const sf = shortFlags[fc]
        const so = shortOpts[fc]
        if (sf)
          expand.push('--' + sf)
        else if (so) {
          const soslice = arg.slice(f + 1)
          const soval = soslice.charAt(0) === '=' ? soslice : '=' + soslice
          expand.push('--' + so + soval)
          f = arg.length
        } else if (arg !== '-' + fc)
          // this will trigger a failure with the appropriate message
          expand.push('-' + fc)
      }
      if (expand.length) {
        args.splice.apply(args, [i, 1].concat(expand))
        i--
        continue
      }
    }

    // XXX special handling for -h, --help

    const argsplit = arg.split('=')
    const literalKey = argsplit.shift()
    const key = literalKey.replace(/^--?/, '')
    let val = argsplit.length ? argsplit.join('=') : null

    const spec = options[key]

    if (!spec)
      throw new Error(`invalid argument: ${literalKey}`)

    if (spec[_flag] && val !== null)
      throw new Error(`value provided for boolean flag: ${key}`)

    if (spec[_opt] && val === null) {
      val = args[++i]
      if (val === undefined)
        throw new Error(`no value provided for option: ${key}`)
    }

    if (spec.alias) {
      const alias = spec[_flag] ? spec.alias
      : [].concat(spec.alias).map(a => a.replace(/\$\{value\}/g, val))
      args.splice.apply(args, [i, 1].concat(alias))
      i--
      continue
    }

    const negate = spec[_flag] && key.substr(0, 3) === 'no-'
    const name = negate ? key.substr(3) : key

    if (spec[_list]) {
      if (spec[_opt]) {
        result[name].push(val)
      } else {
        result[name] = result[name] || 0
        if (negate)
          result[name]--
        else
          result[name]++
      }
    } else {
      // either flag or opt
      result[name] = spec[_flag] ? !negate : val
    }
  }

  if (options.main)
    options.main(result)

  return result
}

module.exports = { jack, flag, opt, list, count }