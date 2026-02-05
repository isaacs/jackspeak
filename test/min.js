import * as min from '../dist/esm/index.min.js'
import * as jack from '../dist/esm/index.js'
import t from 'tap'
t.strictSame(new Set(Object.keys(min)), new Set(Object.keys(jack)))
