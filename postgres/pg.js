const crud = require('./CRUD')

module.exports = class SQL extends crud {
  constructor (db, collName) {
    super(db, collName)

    // Overwrite prod URL here
    this.url = 'https://cs493-assignment1.herokuapp.com'
  }

  /*
     Helper Functions
  */
  respond (Result, Err, res, req) {
    if (Err) {
      res.json(Err)
    }
    if (Result.length !== 0 && req && req.query.page && req.query.limit) {
      this.paginate(req, Result, res)
    } else {
      res.json(Result)
    }
  }

  // parse array to send back sectioned off results
  paginate (req, data, res) {
    let originalUrl = req.originalUrl.split('?')[0]
    let query = req.query
    data = data.slice(query.limit * (query.page - 1), query.limit * query.page)
    let respObj = {
      prevPage: `${this.url}${originalUrl}/?limit=${query.limit}&page=${parseInt(query.page) - 1}`,
      nextPage: `${this.url}${originalUrl}/?limit=${query.limit}&page=${parseInt(query.page) + 1}`,
      data: data
    }
    res.json(respObj)
  }

  splitObjectKeyVals (obj) {
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

  // NOTE: This only works for one query right now.
  // NOT compounded AND/OR only use to get stuff by ID.
  buildQueryByID (key, value) {
    return `${key} = ${value}`
  }

  buildUpdateString (keys, values) {
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
