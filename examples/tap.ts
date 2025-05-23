import { jack } from '../dist/commonjs/index.js'
import * as os from 'node:os'

const defaultParallel = Math.max(
  16,
  typeof os.availableParallelism === 'function' ?
    os.availableParallelism()
  : Math.min(os.cpus().length, 1),
)

const coverageReporters = [
  'clover',
  'cobertura',
  'html',
  'json',
  'json-summary',
  'lcov',
  'lcovonly',
  'none',
  'teamcity',
  'text',
  'text-lcov',
  'text-summary',
]

const j = jack({
  envPrefix: 'TAP',
  allowPositionals: true,
  env: process.env,
  usage: 'tap [<options>] [<cmd> ...[<args>]]',
})
  .description(
    `Executes all the files and interprets their output as TAP
     formatted test result data.  If no files are specified, then
     tap will search for testy-looking files, and run those.
     (See '--test-regex' below.)

     To parse TAP data from stdin, specify "-" as a filename.

     Short options are parsed gnu-style, so for example '-bCRspec' would be
     equivalent to '--bail --no-color --reporter=spec'

     Coverage is not enabled for stdin.

     Much more documentation available at: https://www.node-tap.org/`,
  )

  .heading('The best Foo that ever Fooed')
  .description(
    `
    Executes all the files and interprets their output as
    TAP formatted test result data.

    To parse TAP data from stdin, specify "-" as a filename.

    This is a list:

    - one
    - two
    - three
    `,
  )
  .heading('Subcommands')
  .description(
    `several subcommands are available.

     they are described below.`,
  )
  .heading('bazzle', 2)
  .description('Bazzle the bedazzled razzle mafazzale')
  .heading('blorg', 3)
  .description(
    `When the grolb needs blorging, use this command
     and it will make sure every asdf is a quux.`,
  )
  .description(
    `A pre-formatted description section

     because
 '. \\   what if your usage banner
  '- \\                 needs a baby elephant
   / /_         .---.
  / | \\\\,.\\/--.//    )
  |  \\//        )/  / 
   \\  ' ^ ^    /    )____.----..  6
    '.____.    .___/            \\._) 
       .\\/.                      )
        '\\                       /
        _/ \\/    ).        )    (
       /#  .!    |        /\\    /
       \\  C// #  /'-----''/ #  / 
    .   'C/ |    |    |   |    |mrf  ,
    \\), .. .'OOO-'. ..'OOO'OOO-'. ..\\(,`,
    { pre: true },
  )

  .heading('Basic Options', 2)
  .optList({
    plugin: {
      hint: 'module',
      description: `Configure the tap Test class with the specified plugin.

                    Typically this is set in a .taprc file, not on the command
                    line, and can be managed using the 'tap plugin <add|rm>'
                    command.

                    If the set of plugins does not match that which tap was
                    built with previously, then it will rebuild the Test class
                    prior to running tests.

                    To *exclude* a plugin which has been previously included
                    (perhaps by being part of tap's default set), add it to
                    this list prefixed by a '!' character.`,
    },
  })

  .opt({
    reporter: {
      short: 'R',
      hint: 'reporter',
      description: `Use the specified reporter.  Defaults to
                    'base' when colors are in use, or 'tap'
                    when colors are disabled.

                    In addition to the built-in reporters provided by
                    the treport and tap-mocha-reporter modules, the
                    reporter option can also specify a command-line
                    program or a module to load via require().

                    Command-line programs receive the raw TAP output
                    on their stdin.

                    Modules loaded via require() must export either a
                    writable stream class or a React.Component subclass.
                    Writable streams are instantiated and piped into.
                    React components are rendered using Ink, with tap={tap}
                    as their only property.`,
    },
  })

  .optList({
    'reporter-arg': {
      hint: 'arg',
      short: 'r',
      description: `Args to pass to command-line reporters.  Ignored when using
                    built-in reporters or module reporters.`,
    },
  })

  .opt({
    'coverage-reporter': {
      hint: 'type',
      description: `Output coverage information using the specified
                    istanbul coverage reporter type.

                    Default is 'text' when running on the command line, or
                    'text-lcov' when piping to coveralls.

                    If 'html' is used, then the report will be opened in a web
                    browser after running.

                    This can be run on its own at any time after a test run
                    that included coverage.

                    Built-in coverage reporters:
                    ${coverageReporters.join(' ')}`,
    },
  })

  .flag({
    // TODO: move to @tapjs/fixture plugin
    'save-fixture': {
      short: 'F',
      description: 'Do not clean up fixtures created with t.testdir()',
    },

    bail: {
      short: 'b',
      description: 'Bail out on first failure',
    },
    'no-bail': {
      short: 'B',
      description: 'Do not bail out on first failure (default)',
    },

    comments: {
      description: 'Print all tap comments to process.stderr',
    },

    color: {
      short: 'c',
      description: 'Use colors (Default for TTY)',
    },
    'no-color': {
      short: 'C',
      description: 'Do not use colors (Default for non-TTY)',
    },

    // TODO: move to @tapjs/snapshot plugin
    snapshot: {
      short: 'S',
      description: `Generate snapshot files for 't.matchSnapshot()'
                    assertions.`,
    },

    watch: {
      short: 'w',
      description: `Watch for changes in the test suite or covered program.

                    Runs the suite normally one time, and from then on, re-run
                    just the portions of the suite that are required whenever a
                    file changes.

                    Opens a REPL to trigger tests and perform various
                    actions.`,
    },

    changed: {
      short: 'n',
      description: `Only run tests for files that have changed since the last
                    run.

                    If no prior test run data exists, then all default files
                    are run, as if --changed was not specified.`,
    },

    save: {
      short: 's',
      description: `If <file> exists, then it should be a line- delimited list
                    of test files to run.  If <file> is not present, then all
                    command-line positional arguments are run.

                    After the set of test files are run, any failed test files
                    are written back to the save file.

                    This way, repeated runs with -s<file> will re-run failures
                    until all the failures are passing, and then once again run
                    all tests.

                    Its a good idea to .gitignore the file used for this
                    purpose, as it will churn a lot.`,
    },

    // TODO: move to @tapjs/filter plugin
    only: {
      short: 'O',
      description: `Only run tests with {only: true} option, or created with
                    t.only(...) function.`,
    },
  })

  .optList({
    // TODO: move to @tapjs/filter plugin
    grep: {
      hint: 'pattern',
      short: 'g',
      description: `Only run subtests tests matching the specified pattern.

                    Patterns are matched against top-level subtests in each
                    file.  To filter tests at subsequent levels, specify this
                    option multiple times.

                    To specify regular expression flags, format pattern like a
                    JavaScript RegExp literal.  For example: '/xyz/i' for
                    case-insensitive matching.`,
    },
  })

  .flag({
    // TODO: move to @tapjs/filter plugin
    invert: {
      short: 'i',
      description: 'Invert the matches to --grep patterns. (Like grep -v)',
    },
    'no-invert': {
      short: 'I',
      description:
        'Do not invert the matches to --grep patterns. (default)',
    },

    diag: {
      description: `Set to show diagnostics by default for both passing tests.
                    If not set, then diagnostics are printed by default for
                    failing tests, and not for passing tests.`,
    },
    'no-diag': {
      description: `Do not show diagnostics by default for passing or failing
                    tests. If not set, then diagnostics are printed by default
                    for failing tests, and not for passing tests.`,
    },
  })
  .num({
    timeout: {
      hint: 'n',
      short: 't',
      default: 30,
      description: `Time out test files after <n> seconds. Defaults to 30.
                    Setting to 0 allows tests to run forever.

                    When a test process calls t.setTimeout(n) on the top-level
                    tap object, it also updates this value for that specific
                    process.`,
    },
  })

  .optList({
    files: {
      hint: 'filename',
      description: `Alternative way to specify test set rather than using
                    positional arguments.  Supported as an option so that
                    test file arguments can be specified in .taprc and
                    package.json files.`,
    },
  })

  .heading('Test Running Options')

  .num({
    jobs: {
      hint: 'n',
      short: 'j',
      default: defaultParallel,
      description: `Run up to <n> test files in parallel.

                    By default, this will be set to the number of CPUs on
                    the system (${defaultParallel}).

                    Set --jobs=1 to disable parallelization entirely.`,
    },
  })

  .opt({
    before: {
      hint: 'module',
      description: `A node program to be run before test files are executed.

                    Exiting with a non-zero status code or a signal will fail
                    the test run and exit the process in error.`,
    },

    after: {
      hint: 'module',
      description: `A node program to be executed after tests are finished.

                    This will be run even if a test in the series fails with
                    a bailout, but it will *not* be run if a --before script
                    fails.

                    Exiting with a non-zero status code or a signal will fail
                    the test run and exit the process in error.`,
    },

    'output-file': {
      hint: 'filename',
      short: 'o',
      description: `Send the raw TAP output to the specified file.  Reporter
                    output will still be printed to stdout, but the file will
                    contain the raw TAP for later replay or analysis.`,
    },

    'output-dir': {
      hint: 'dir',
      short: 'd',
      description: `Send the raw TAP output to the specified directory.  A
                    separate .tap file will be created for each test file that
                    is run.  Reporter output will still be printed to stdout,
                    but the files will contain the raw TAP for later replay or
                    analysis.

                    Files will be created to match the folder structure and
                    filenames of test files run, but with '.tap' appended to
                    the filenames.`,
    },

    include: {
      hint: 'pattern',
      default:
        '**/{' +
        'test*(s)|__test*(s)__)/**/*,' +
        '*.@(test*(s)|spec),' +
        'test*(s)' +
        '}.([mc]js|[jt]s*(x))',
      description: `A glob expression pattern indicating tests to run if no
                    positional arguments are provided to the 'tap run' command.

                    By default, tap will search for all files ending in .ts,
                    .tsx, .cts, .mts, .js, .jsx, .cjs, or .mjs, in a top-level
                    folder named test, tests, or __tests__, or any file ending
                    in '.spec.' or '.test.' before a supported extension, or a
                    top-level file named 'test.(js,jsx,...)' or
                    'tests.(js,jsx,...)'

                    No files excluded by the 'exclude' option will be loaded,
                    meaning so dependencies, build artifacts in 'dist', and
                    test fixtures and snapshots will be ignored.`,
    },

    exclude: {
      hint: 'pattern',
      default: '**/@(fixture*(s)|dist)/**',
      description: `A glob pattern indicating which filenames should NEVER
                    be run as tests.  This overrides the 'include' option.

                    Defaults to excluding any folders named dist, fixture, or
                    fixtures.

                    Note: folders named tap-snapshots, node_modules, .git, and
                    .hg are ALWAYS excluded from the default test file set.  If
                    you wish to run tests in these folders, then name the test
                    files on the command line as positional arguments.`,
    },
  })

  .optList({
    'test-arg': {
      hint: 'arg',
      description: `Pass an argument to test files spawned by the tap command
                    line executable. This can be specified multiple times to
                    pass multiple args to test scripts.`,
    },

    'test-env': {
      hint: 'key=value',
      description: `Pass a key=value (ie, --test-env=key=value) to set an
                    environment variable in the process where tests are run.

                    If a value is not provided, such as '--test-env=key', then
                    the key is ensured to not be set in the environment.  To
                    set a key to the empty string, use --test-env=key=`,
    },

    'node-arg': {
      hint: 'arg',
      // this is one that the mock plugin might want to add to?
      // or should we just always force our loaders in?
      description: `Pass an argument to Node binary in all child processes.
                    Run 'node --help' to see a list of all relevant arguments.
                    This can be specified multiple times to pass multiple args
                    to Node.`,
    },
  })

  .heading('Other Options')

  .flag({
    debug: { description: 'Turn on debug mode' },

    versions: {
      short: 'V',
      description:
        'Show the version of tap and relevant tap libraries in use.',
    },

    version: {
      short: 'v',
      description: 'Show the version of this program.',
    },

    help: {
      short: 'h',
      type: 'boolean',
      description: 'show this help banner',
    },
  })

try {
  const { values, positionals } = j.parse()
  if (values.help) console.log(j.usage())
  else {
    console.log({ values, positionals })
    console.log(
      Object.entries(process.env).filter(([k]) => k.startsWith('TAP')),
    )
  }
} catch (e) {
  console.error(e)
}
