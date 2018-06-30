/* global describe it */

// import config info
require('dotenv').config()

const chai = require('chai')
const expect = chai.expect

const tableNames = require('./tableNames')

const { Client } = require('pg')
const client = new Client()

describe('Database connect', function() {
  it('is using port 32769', function() {
    expect(process.env.PGPORT).to.equal('32769')
  })

  it('is using host localhost', function() {
    expect(process.env.PGHOST).to.equal('localhost')
  })
})

describe('Database setup', function() {
  it('connects to the database', function(done) {
    client.connect().should.be.fulfilled.and.notify(done)
  })

  describe('drop test schema', function() {
    it('dropped the test schema', function(done) {
      client.query('DROP SCHEMA IF EXISTS test CASCADE')
        .should.be.fulfilled.and.notify(done)
    })
  })

  describe('create the test schema', function() {
    it('created the test schema', function(done) {
      client.query(`CREATE SCHEMA test`).should.be.fulfilled.and.notify(done)
    })
  })

  for (let table of tableNames) {
    describe(`${table} table`, function() {
      describe(`copy the ${table} schema from the production schema`, function() {
        it(`coppied the ${table} schema`, function(done) {
          client.query(
            `CREATE TABLE test.${table} (LIKE ${table} INCLUDING ALL)`
          ).should.be.fulfilled.and.notify(done)
        })
      })
      describe(`empty the ${table} table`, function() {
        it('succeded', function(done) {
          client.query(`TRUNCATE test.${table} CASCADE`)
            .should.be.fulfilled.and.notify(done)
        })
      })

      describe(`check contents of ${table} table`, function() {
        it('is empty', async function() {
          let res = await client.query(`SELECT COUNT(*) FROM test.${table}`)
          return res.rows[0].count === 0
        })
      })
    })
  }
})
