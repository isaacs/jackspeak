import { jack } from '../dist/commonjs/index.js'

const j = jack({
  usage: `
git tag [-a | -s | -u <key-id>] [-f] [-m <msg> | -F <file>] [-e]
               <tagname> [<commit> | <object>]
   or: git tag -d <tagname>...
   or: git tag [-n[<num>]] -l [--contains <commit>] [--no-contains <commit>]
               [--points-at <object>] [--column[=<options>] | --no-column]
               [--create-reflog] [--sort=<key>] [--format=<format>]
               [--merged <commit>] [--no-merged <commit>] [<pattern>...]
   or: git tag -v [--format=<format>] <tagname>...
    `,
})
  .flag({
    list: {
      short: 'l',
      description: 'list tag names',
    },
  })
  .opt({
    n: {
      hint: 'n',
      description: 'print <n> lines of each tag message',
    },
  })
  .flag({
    delete: {
      short: 'd',
      description: 'delete tags',
    },
  })
  .flag({
    verify: {
      short: 'v',
      description: 'verify tags',
      negate: { hidden: true },
    },
  })
  .flag({
    help: {
      short: 'h',
    },
  })
  .description('Tag creation options')
  .flag({
    annotate: {
      short: 'a',
      description: 'annotated tag, needs a message',
    },
  })
  .opt({
    message: {
      short: 'm',
      hint: 'message',
      description: 'tag message',
    },
    file: {
      short: 'F',
      hint: 'file',
      description: 'read message from file',
    },
  })
  .flag({
    sign: {
      short: 's',
      description: 'annotated and GPG-signed tag',
    },
  })
  .opt({
    cleanup: {
      hint: 'mode',
      description: 'how to strip spaces and #comments from message',
    },
    'local-user': {
      short: 'u',
      hint: 'key-id',
      description: 'use another key to sign the tag',
    },
  })
  .flag({
    force: {
      short: 'f',
      description: 'replace the tag if exists',
    },
  })
  .description('Tag listing options')
  .opt({
    column: {
      hint: 'style',
      description: 'show tag list in columns',
    },
    sort: {
      hint: 'type',
      description: 'sort tags',
    },
    contains: {
      hint: 'commit',
      description: 'print only tags that contain the commit',
    },
    'points-at': {
      hint: 'object',
      description: 'print only tags of the object',
    },
  })

const { values, positionals } = j.parse()
if (values.help) console.log(j.usage())
else console.log({ values, positionals })
