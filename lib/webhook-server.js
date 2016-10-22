// my-module.js
exports.command = 'webhook'

exports.describe = 'make a get HTTP request'

exports.builder = {
  port: {
    default: 9999
  }
}

exports.handler = function (argv) {
  // do something with argv.
}
