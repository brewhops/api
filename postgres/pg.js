const Crud = require('./CRUD')

module.exports = class Pg extends Crud {
  constructor(collName) {
    super(collName)
    // Production URL
    this.url = ''
  }

  splitObjectKeyVals(obj) {
    let keys = []
    let values = []
    let escapes = []
    let idx = 1
    for (var key in obj) {
      keys.push(key)
      values.push(obj[key])
      escapes.push(`\$${idx}`) // eslint-disable-line
      idx++
    }
    keys = keys.toString()
    escapes = escapes.toString()

    return {
      keys,
      values,
      escapes
    }
  }

  // NOTE: This only works for one query.
  // NOT compounded AND/OR only use to get stuff by ID.
  buildQueryByID(key, value) {
    return `${key} = ${value}`
  }

  buildUpdateString(keys, values) {
    keys = keys.split(',')
    let query = ``
    let idx = 1
    for (var i in keys) {
      let key = keys[i]
      query += `${key} = \$${idx}, ` // eslint-disable-line
      idx++
    } // match keys to the current escape index '$1'

    query = query.substring(0, query.length - 2) // remove trailing ', '
    return {
      query,
      idx
    }
  }
}
