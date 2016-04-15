'use strict'
var util = require('util')
var boil = require('../')
var Transform = require('stream').Transform

module.exports = RenderStream

/**
@classdesc Renders the incoming doclet data using the specified handlebars assets
@param [options] {object} - The render options
@param [options.template] {string} - A handlebars template to insert your documentation into. 
@param [compileOptions] {object} - The options to be passed to `handlebars.compile`
@return {stream} A readable stream containing the rendered markdown
@alias module:boil-js.renderStream
```
*/
function RenderStream (options, compileOptions) {
  if (!(this instanceof RenderStream)) return new RenderStream(options, compileOptions)
  Transform.call(this, options)

  this.json = new Buffer(0)
  this.options = options
  this.compileOptions = compileOptions
}
util.inherits(RenderStream, Transform)

RenderStream.prototype._transform = function (chunk, enc, done) {
  if (chunk) this.json = Buffer.concat([ this.json, chunk ])
  done()
}

RenderStream.prototype._flush = function () {
  var data
  try {
    data = JSON.parse(this.json)
  } catch(err) {
    err.message = '[boil.RenderStream] input json failed to parse: ' + err.message + '\n'
    err.message += 'input: \n'
    err.message += this.json.toString()
    return this.emit('error', err)
  }
  try {
    data.options = this.options
    var result = boil.render(this.options.template, data, this.compileOptions)
    this.push(result)
  } catch(err) {
    this.emit('error', err)
  }
  this.push(null)
}
