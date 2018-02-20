import Handlebars from 'handlebars/runtime'

module.exports = Handlebars.registerHelper('equals', function(a, b, options) {
  if (a === b) {
    return options.fn(this)
  }
  return options.inverse(this)
})

module.exports = Handlebars.registerHelper('and', function(a, b, options) {
  if (a && b) {
    return options.fn(this)
  }
  return options.inverse(this)
})