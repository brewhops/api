/* global describe it before after */

require('dotenv').config()

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.should()

const request = require('supertest')
const app = require('../index.js')
const agent = request.agent(app)

const { Pool } = require('pg')
const prodPool = new Pool()
let testPool, client, prodClient

let self = null

module.exports = class CRUD {
  // table: Name of the table that it will connect to
  // logic: The logic that it will test
  // routeName: Name of the route it will hit
  // tables:
  //   An array of table names so it knows which tables to duplicate in the
  //   test schema
  constructor(table, Logic, routeName, tables) {
    // the source table that we will copy
    this.srcTable = table
    this.schemaName = 'test_' + table
    // the test table we will work with in tests
    this.table = this.schemaName + '.' + table
    this.logic = new Logic(this.table)
    this.route = routeName
    this.tables = tables
    self = this

    this.itemID = null

    this.dbSetup()
    this.testPoolInit()
  }

  getRoute() {
    return self.route
  }

  async tableCount() {
    let res = await client.query(`SELECT COUNT(*) FROM ${self.table}`)
    return res.rows[0].count
  }

  dbSetup() {
    describe(`${self.srcTable} setup`, function() {
      // connect the clients before the test
      before(async function() {
        prodClient = await prodPool.connect()
      })

      // disconnect when done
      after(function() {
        prodClient.release()
      })

      it(`dropped schema ${self.schemaName}`, function(done) {
        prodClient.query(`DROP SCHEMA IF EXISTS ${self.schemaName} CASCADE`)
          .should.be.fulfilled.and.notify(done)
      })
      it(`created schema ${self.schemaName}`, function(done) {
        prodClient.query(`CREATE SCHEMA ${self.schemaName}`)
          .should.be.fulfilled.and.notify(done)
      })
      for (let table of self.tables) {
        it(`coppied ${table} to ${self.schemaName}.${table}`, function(done) {
          prodClient.query(
            `CREATE TABLE ${self.schemaName}.${table}
            (LIKE ${table} INCLUDING ALL)`
          ).should.be.fulfilled.and.notify(done)
        })
        it(`cleared out the ${self.schemaName}.${table} table`, function(done) {
          prodClient.query(`TRUNCATE ${self.schemaName}.${table} CASCADE`)
            .should.be.fulfilled.and.notify(done)
        })
      }
    })
    describe('Connect route', function() {
      it(`logics table name is ${self.table}`, function() {
        self.logic.tableName().should.equal(self.table)
      })
    })
  }

  testPoolInit() {
    testPool = new Pool({ table: self.table })
  }

  GETall() {
    before(async function() {
      client = await testPool.connect()
      self.logic.connectToDB()
    })

    // disconnect when done
    after(function() {
      client.release()
      self.logic.disconnectFromDB()
    })

    describe('GET /' + self.route, function() {
      it('responds with json and a 200 code', function(done) {
        agent.get('/' + self.route)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }

  POST(input) {
    before(async function() {
      client = await testPool.connect()
      self.logic.connectToDB()
    })

    // disconnect when done
    after(function() {
      client.release()
      self.logic.disconnectFromDB()
    })

    describe('POST /' + self.route, function() {
      it('rejected an empty post', function(done) {
        agent.post('/' + self.route)
          .send({})
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })

      it('has an empty table', function() {
        return self.tableCount().should.eventually.equal('0')
      })

      it('created an item', function(done) {
        agent.post('/' + self.route)
          .send(input.valid)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(function(res) {
            res.body.id.should.be.a('number')
            self.itemID = res.body.id
          })
          .expect(201)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })

      it('got an id back', function() {
        self.itemID.should.be.a('number')
      })

      it('has one item in the table', function() {
        return self.tableCount().should.eventually.equal('1')
      })
    })
  }

  GETid() {
    describe('GET /' + self.route + '/id/', function() {
      it('rejects an invalid selection', function(done) {
        agent.get('/' + self.route + '/id/-1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('gets a valid selection', function(done) {
        agent.get('/' + self.route + '/id/' + self.itemID)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }

  PATCH(input) {
    describe('PATCH /' + self.route + '/id/', function() {
      it('rejects an invalid selection', function(done) {
        agent.patch('/' + self.route + '/id/-1')
          .send({})
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('updates a valid selection', function(done) {
        agent.patch('/' + self.route + '/id/' + self.itemID)
          .send(input)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }

  DELETE() {
    describe('DELETE /' + self.route + '/id/', function() {
      it('rejects an invalid selection', function(done) {
        agent.delete('/' + self.route + '/id/-1')
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('accepts a valid selection', function(done) {
        agent.delete('/' + self.route + '/id/' + self.itemID)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }
}
