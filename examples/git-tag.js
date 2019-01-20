// usage for git-tag
const { jack, flag, opt } = require('../')
jack({
  usage: [
    'git tag [-a | -s | -u <key-id>] [-f] [-m <msg> | -F <file>] <tagname> [<head>]',
    'git tag -d <tagname>...',
    'git tag -l [-n[<num>]] [--contains <commit>] [--points-at <object>] [<pattern>...]',
    'git tag -v <tagname>...',
  ],
  list: flag({
    short: 'l',
    description: 'list tag names',
    negate: { hidden: true },
  }),
  n: opt({
    hint: 'n',
    description: 'print <n> lines of each tag message',
  }),
  delete: flag({
    short: 'd',
    description: 'delete tags',
    negate: { hidden: true },
  }),
  verify: flag({
    short: 'v',
    description: 'verify tags',
    negate: { hidden: true },
  }),
  '--': flag({ hidden: true }),
  help: flag({ hidden: true }),
}, {
  description: 'Tag creation options',
  annotate: flag({
    short: 'a',
    description: 'annotated tag, needs a message',
  }),
  message: opt({
    short: 'm',
    hint: 'message',
    description: 'tag message'
  }),
  file: opt({
    short: 'F',
    hint: 'file',
    description: 'read message from file'
  }),
  sign: flag({
    short: 's',
    description: 'annotated and GPG-signed tag'
  }),
  cleanup: opt({
    hint: 'mode',
    description: 'how to strip spaces and #comments from message'
  }),
  'local-user': opt({
    short: 'u',
    hint: 'key-id',
    description: 'use another key to sign the tag',
  }),
  force: flag({
    short: 'f',
    description: 'replace the tag if exists'
  })
}, {
  description: 'Tag listing options',
  column: opt({
    hint: 'style',
    description: 'show tag list in columns',
  }),
  sort: opt({
    hint: 'type',
    description: 'sort tags',
  }),
  contains: opt({
    hint: 'commit',
    description: 'print only tags that contain the commit'
  }),
  'points-at': opt({
    hint: 'object',
    description: 'print only tags of the object'
  })
})
