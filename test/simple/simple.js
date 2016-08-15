'use strict'
const boil = require('../../')
const test = require('test-runner')
const a = require('core-assert')

test('simple', function () {
  class Gets {
    toString () { return 'four' }
  }
  const template = 'one ${yeah} three ${gets} five'
  const map = new Map([
    [ 'yeah', 'two' ],
    [ 'gets', new Gets() ]
  ])
  const result = boil(template, map)
  a.strictEqual(result, 'one two three four five')
})
