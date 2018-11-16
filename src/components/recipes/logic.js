let postgres = require('./../../postgres/pg')
const is = require('is')
let self = null

module.exports = class userLogic extends postgres {
  constructor(tableName) {
    super(tableName)
    self = this
  }

  // GET
  async getRecipes(req, res) {
    const { rows } = await self.read()
    res.json(rows)
  }

  async getRecipe(req, res, next) {
    try {
      const { rows } = await self.readById(req.params.id)
      if (rows.length > 0) {
        res.json(rows[0])
      } else {
        next()
      }
    } catch (e) {
      res.status(500).json(e)
    }
  }

  // POST
  async createRecipe(req, res) {
    const { keys, values, escapes } = self.splitObjectKeyVals(req.body)
    const { rows } = await self.create(keys, escapes, values)
    res.status(201).json(rows[0])
  }

  // PATCH/PUT
  async updateRecipe(req, res, next) {
    if (is.empty(req.body)) {
      res.status(400).json({err: 'Request does not match valid form'})
    } else {
      let { keys, values } = self.splitObjectKeyVals(req.body)
      const { query, idx } = self.buildUpdateString(keys, values)
      values.push(req.params.id) // add last escaped value for where clause

      try {
        const { rows } = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
        if (rows.length > 0) {
          res.json(rows[0])
        } else {
          next()
        }
      } catch (e) {
        res.status(500).json(e)
      }
    }
  }

  // DELETE
  async deleteRecipe(req, res, next) {
    try {
      const response = await self.deleteById(req.params.id)
      if (response.rowCount > 0) {
        res.status(200).json()
      } else {
        next()
      }
    } catch (e) {
      res.status(500).json(e)
    }
  }
}
