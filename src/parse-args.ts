// this gets overwritten with a polyfill appropriate for each build target,
// which tests whether parseArgs is in util, and if not, provides
// @pkgjs/parseargs
export { parseArgs } from 'util'
