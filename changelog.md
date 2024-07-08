# 4.0

- Require modern node versions

# 3.4

- abstract out post-parse actions, slice process.argv in parseRaw

# 3.3

- Add `stopAtPositionalTest` method

# 3.2

- still validate if stopAtPositional is set
- add parseRaw() method, to parse without side effects
- improve fenced code sections in usage output
- add hint to toJSON output

# 3.1

- Add `validOptions` config option, to specify a discrete set of
  acceptable values.
- `validate` methods now take an `unknown` argument, which is
  more appropriate than `any` as it encourages more deliberate
  type assertions.

# 3.0

- Move custom `Error` fields to the `cause` property where they
  belong.

# 2.3

- add `jack.usageMarkdown()` method

# 2.2

- add support for {pre:true} on description fields
- add heading level support

# 2.1

- Add `jack.setConfigValues()` method

# 2.0

- Complete rewrite as hybrid TypeScript module

# 1.1

- Cosmetic changes to help output
- `implies` support
- `valid` option value lists

# 1.0

Multi-section parsing, environment variables

# 0.1

Automatic `--help` usage output handling

# 0.0

Basic functionality. No help or usage output support yet.
