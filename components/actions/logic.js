let postgres = require('./../../postgres/pg')
let self = null

module.exports = class actionLogic extends postgres {
  constructor(tableName) {
    super(process.env.PGDATABASE, tableName)
    self = this
  }

  // GET
  async getActions(req, res) {
    const { rows } = await self.read()
    res.json(rows)
  }

  async getAction(req, res, next) {
    try {
      const { rows } = await self.readById(req.params.id)
      if (rows.length > 0) {
        res.json(rows[0])
      } else {
        next()
      }
    } catch (e) {
      console.log(e)
      res.status(500).json(e)
    }
  }

  // POST
  async createAction(req, res) {
    const { keys, values, escapes } = self.splitObjectKeyVals(req.body)
    const { rows } = await self.create(keys, escapes, values)
    res.status(201).json(rows[0])
  }

  // PATCH/PUT
  async updateAction(req, res, next) {
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

  // DELETE
  async deleteAction(req, res, next) {
    try {
      const { rows } = await self.deleteById(req.params.id)
      if (rows.length > 0) {
        res.json(rows)
      } else {
        next()
      }
    } catch (e) {
      res.status(500).json(e)
    }
  }
}
