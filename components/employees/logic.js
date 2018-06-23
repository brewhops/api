const postgres = require('./../../postgres/pg')
const bcrypt = require('bcrypt')
const boom = require('boom')
const saltRounds = 8
const { generateAuthToken } = require('./../../middleware/auth')
const { userMatchAuthToken } = require('../../util/auth')

let self = null

const databaseName = process.env.PGDATABASE
const tableName = 'employees'
const safeUserData = `id, first_name, last_name, username, phone, access_level`

module.exports = class userLogic extends postgres {
  constructor () {
    super(databaseName, tableName)
    self = this
  }

  // GET
  async getUsers (req, res) {
    const { rows } = await self.read(safeUserData)
    res.json(rows)
  }

  async getUser (req, res) {
    const { rows } = await self.readById(req.params.id)
    res.json(rows)
  }

  // POST
  async createUser (req, res) {
    const prevUser = await self.readByUsername(req.body.username)
    req.body.password = bcrypt.hashSync(req.body.password, saltRounds)
    const { keys, values, escapes } = self.splitObjectKeyVals(req.body)

    if (prevUser.rows.length !== 0) {
      res.json(boom.badRequest('Username already taken'))
    } else {
      const { rows } = await self.create(keys, escapes, values, safeUserData)
      const returnedUser = rows[0]
      returnedUser.token = await generateAuthToken(returnedUser.username)
      res.json(rows)
    }
  }

  async login (req, res) {
    const prevUser = await self.readByUsername(req.body.username)

    if (prevUser.rows.length === 0) {
      res.json(boom.badRequest('Not authorized'))
    } else {
      const password = bcrypt.compareSync(req.body.password, prevUser.rows[0].password)
      if (password) {
        const token = await generateAuthToken(req.body.username)
        res.json({ token: token })
      } else {
        res.json(boom.badRequest('Incorrect password'))
      }
    }
  }

  // PATCH/PUT
  async updateUser (req, res) {
    let { keys, values } = self.splitObjectKeyVals(req.body)
    const { query, idx } = self.buildUpdateString(keys, values)
    values.push(req.params.id) // add last escaped value for where clause
    const { rows } = await self.readById(req.params.id)

    if (rows.length === 0 || !userMatchAuthToken(req.user, rows[0].username)) {
      res.json(boom.badRequest('Not Authorized'))
    } else {
      let results = await self.update(query, `id = \$${idx}`, values) // eslint-disable-line
      res.json(results.rows)
    }
  }

  // DELETE
  async deleteUser (req, res) {
    const { rows } = await self.readById(req.params.id)
    if (rows.length === 0 || !userMatchAuthToken(req.user, rows[0].username)) {
      res.json(boom.badRequest('Not Authorized'))
    } else {
      let results = await self.deleteById(req.params.id)
      res.json(results.rows)
    }
  }
}
