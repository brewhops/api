const { Client } = require('pg')

module.exports = class CRUD {
  constructor (db, tableName) {
    this.client = null
    this.connectToDB(db)
    this.table = tableName
  }

  async connectToDB (db) {
    if (process.env.ENVIRONMENT) { // if Prod
      this.client = new Client()
    } else {
      this.client = new Client({ database: 'postgres' }) // for brandons local setup
    }
    this.client.connect()
      .then(succ => console.log(`${this.table} connected to DB!`))
      .catch(err => console.log(`Oh nose! Error! ${err}`))
  }

  async create (columns, conditions, escaped, returns = '*') {
    return this.client.query(`INSERT INTO ${this.table} (${columns}) VALUES (${conditions}) RETURNING ${returns}`, escaped)
  }

  // NOT TESTED IN PG
  async createInTable (columns, table, conditions, escaped) {
    return this.client.query(`INSERT INTO ${table} (${columns}) VALUES (${conditions})`, escaped)
  }

  async read (columns = `*`, conditions = 'true', escaped = '') {
    return this.client.query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped)
  }

  async readById (escaped) {
    return this.client.query(`SELECT * FROM ${this.table} WHERE id = $1`, [escaped])
  }

  async readByUsername (username) {
    return this.client.query(`SELECT * FROM ${this.table} WHERE username = $1`, [username])
  }

  // NOT TESTED IN PG
  async readInTable (columns = `*`, table = `${this.table}`, conditions = '', escaped) {
    return this.client.query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped)
  }

  async update (columns, conditions, escaped) {
    return this.client.query(`UPDATE ${this.table} SET ${columns} WHERE ${conditions} RETURNING *`, escaped)
  }

  async delete (conditions, escaped) {
    return this.client.query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped)
  }

  async deleteById (escaped) {
    return this.client.query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped])
  }

  // NOT TESTED IN PG
  async deleteInTable (table, conditions, escaped) {
    return this.client.query(`DELETE FROM ${table} WHERE ${conditions}`, escaped)
  }
}
