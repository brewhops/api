const { Client } = require('pg')

module.exports = class CRUD {
  constructor(tableName) {
    this.client = null
    this.table = tableName
  }

  tableName() {
    return this.table
  }

  connectToDB() {
    if (process.env.NODE_ENV === 'test') {
      this.client = new Client({
        user: process.env.TEST_PG_USER,
        database: process.env.TEST_PG_DATABASE,
        password: process.env.TEST_PG_PASSWORD,
        port: process.env.TEST_PG_PORT,
        host: process.env.TEST_PG_HOST
      })
    } else {
      this.client = new Client()
    }
    return this.client.connect()
  }

  disconnectFromDB() {
    return this.client.end()
  }

  async create(columns, conditions, escaped, returns = '*') {
    return this.client.query(`INSERT INTO ${this.table} (${columns}) VALUES (${conditions}) RETURNING ${returns}`, escaped)
  }

  // NOT TESTED IN PG
  async createInTable(columns, table, conditions, escaped) {
    return this.client.query(`INSERT INTO ${table} (${columns}) VALUES (${conditions})`, escaped)
  }

  async read(columns = `*`, conditions = 'true', escaped = '') {
    return this.client.query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped)
  }

  async readById(escaped) {
    return this.client.query(`SELECT * FROM ${this.table} WHERE id = $1`, [escaped])
  }

  async readByUsername(username) {
    return this.client.query(`SELECT * FROM ${this.table} WHERE username = $1`, [username])
  }

  // NOT TESTED IN PG
  async readInTable(columns = `*`, table = `${this.table}`, conditions = '', escaped) {
    return this.client.query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped)
  }

  async update(columns, conditions, escaped) {
    return this.client.query(`UPDATE ${this.table} SET ${columns} WHERE ${conditions} RETURNING *`, escaped)
  }

  async delete(conditions, escaped) {
    return this.client.query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped)
  }

  async deleteById(escaped) {
    return this.client.query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped])
  }

  // NOT TESTED IN PG
  async deleteInTable(table, conditions, escaped) {
    return this.client.query(`DELETE FROM ${table} WHERE ${conditions}`, escaped)
  }
}
