let postgres = require('./../../postgres/pg')
let self = null

const databaseName = process.env.PGDATABASE
const tableName = 'recipes'
module.exports = class userLogic extends postgres {
  constructor () {
    super(databaseName, tableName)
    self = this
  }

  // GET
  async getRecipes (req, res) {
    const { rows } = await self.read()
    res.json(rows)
  }

  async getRecipe (req, res) {
    const { rows } = await self.readById(req.params.id)
    res.json(rows)
  }

  // POST
  async createRecipe (req, res) {
    const { keys, values, escapes } = self.splitObjectKeyVals(req.body)
    const { rows } = await self.create(keys, escapes, values)
    res.json(rows)
  }

  // PATCH/PUT
  async updateRecipe (req, res) {
    let { keys, values } = self.splitObjectKeyVals(req.body)
    const { query, idx } = self.buildUpdateString(keys, values)
    values.push(req.params.id) // add last escaped value for where clause

    const { rows } = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
    res.json(rows)
  }

  // DELETE
  async deleteRecipe (req, res) {
    const { rows } = await self.deleteById(req.params.id)
    res.json(rows)
  }
}
