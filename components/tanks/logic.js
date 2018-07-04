let postgres = require('./../../postgres/pg')
const is = require('is')
let self = null

module.exports = class tankLogic extends postgres {
  constructor(tableName) {
    super(process.env.PGDATABASE, tableName)
    self = this
  }

  // GET
  async getTanks(req, res) {
    try {
      const { rows } = await self.read()
      res.json(rows)
    } catch (e) {
      console.log(e)
      res.status(500).json(e)
    }
  }

  async getTank(req, res, next) {
    try {
      // get the tank by that ID
      const { rows } = await self.readById(req.params.id)
      // if it returns at least one tank
      if (rows.length > 0) {
        // return that tank
        res.json(rows[0])
      } else {
        // let the user know that tank does not exist
        next()
      }
    } catch (e) {
      res.status(400).json(e)
    }
  }

  async getTankData(req, res, next) {
    const id = parseInt(req.params.id)

    let query = `
      SELECT
        t.status,
        b.name,
        b.volume,
        b.bright,
        b.generation,
        v.temperature,
        v.PH,
        v.SG,
        v.ABV,
        v.pressure,
        v.measured_on,
        r.airplane_code,
        r.instructions,
        a.name,
        a.description,
        e.username
      FROM tanks t, batches b,  recipes r, versions v, tasks ts, actions a, employees e
      WHERE t.id = $1
      AND b.tank_id = t.id
      AND r.id = b.recipe_id
      AND v.batch_id = b.id
      AND v.completed = FALSE
      AND ts.batch_id = b.id
      AND ts.completed_on = NULL
      AND a.id = ts.action_id
      AND e.id = ts.employee_id`
    try {
      const results = await self.client.query(query, [ id ])
      res.json(results.rows)
    } catch (e) {
      res.json(e)
    }
  }

  // POST
  async createTank(req, res) {
    const { keys, values, escapes } = self.splitObjectKeyVals(req.body)
    try {
      const { rows } = await self.create(keys, escapes, values)
      res.status(201).json(rows[0])
    } catch (e) {
      res.status(400).json(e)
    }
  }

  // PUT/PATCH
  async updateTank(req, res, next) {
    if (is.empty(req.body)) {
      res.status(400).json({err: 'Request does not match valid form'})
    } else {
      const { keys, values } = self.splitObjectKeyVals(req.body)
      const { query, idx } = self.buildUpdateString(keys, values)
      values.push(req.params.id) // add last escaped value for where clause

      const { rows } = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
      if (rows.length > 0) {
        res.json(rows)
      } else {
        next()
      }
    }
  }

  // DELETE
  async deleteTank(req, res, next) {
    try {
      const { rows } = await self.deleteById(req.params.id)
      if (rows.length > 0) {
        res.status(200).json(rows)
      } else {
        next()
      }
    } catch (e) {
      res.status(500).json(e)
    }
  }
}
