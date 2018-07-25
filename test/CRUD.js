/*
A redefinition of the CRUD class used in the production environment.
This is redefined because it is geared towards testing.
*/

/* global describe it before after */

require('dotenv').config()

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.should()

const request = require('supertest')
const app = require('../index.js')
const agent = request.agent(app)

const { Pool } = require('pg')
let prodPool = null
if (process.env.NODE_ENV === 'test') {
  prodPool = new Pool({
    user: process.env.TEST_PG_USER,
    database: process.env.TEST_PG_DATABASE,
    password: process.env.TEST_PG_PASSWORD,
    port: process.env.TEST_PG_PORT,
    host: process.env.TEST_PG_HOST
  })
} else {
  prodPool = new Pool()
}
let testPool, client, prodClient

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

    this.itemID = null

    this.dbSetup()
    this.testPoolInit()
  }

  getRoute() {
    return this.route
  }

  async tableCount() {
    let res = await client.query(`SELECT COUNT(*) FROM ${this.table}`)
    return res.rows[0].count
  }

  dbSetup() {
    let self = this
    describe(`${self.srcTable} setup`, function() {
      // connect the clients before the test
      before(async function() { prodClient = await prodPool.connect() })
      // disconnect when done
      after(function() { prodClient.release() })

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
    testPool = new Pool({ table: this.table })
  }

  GETall() {
    let self = this
    before(async function() {
      client = await testPool.connect()
      self.logic.connectToDB()
    })
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
    let self = this
    let tableCount = null
    before(async function() {
      self.logic.connectToDB()
    })
    after(function() {
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

      it('created an item', function(done) {
        self.tableCount().then(function(count) { tableCount = count })
        agent.post('/' + self.route)
          .send(input)
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

      it('has one more item in the table', function() {
        tableCount = (parseInt(tableCount) + 1).toString()
        return self.tableCount().should.eventually.equal(tableCount)
      })
    })
  }

  GETid() {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

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

  GETidwithToken(token) {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

    describe('GET /' + self.route + '/id/', function() {
      it('rejects an invalid selection', function(done) {
        agent.get('/' + self.route + '/id/-1')
          .set('Authorization', 'Bearer ' + token)
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('gets a valid selection', function(done) {
        agent.get('/' + self.route + '/id/' + self.itemID)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }

  PATCH(input) {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

    describe('PATCH /' + self.route + '/id/', function() {
      it('rejects an invalid selection', function(done) {
        agent.patch('/' + self.route + '/id/-1')
          .send(input)
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('rejects an empty object', function(done) {
        agent.patch('/' + self.route + '/id/' + self.itemID)
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

  PATCHwithToken(token, input) {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

    describe('PATCH /' + self.route + '/id/', function() {
      // create a element that we will edit
      it('creates an element', function(done) {
        agent.post('/' + self.route)
          .send(input.post)
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

      it('rejects an invalid token', function(done) {
        agent.patch('/' + self.route + '/id/' + self.itemID)
          .send(input.patch)
          .expect(401)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('rejects an empty object', function(done) {
        agent.patch('/' + self.route + '/id/' + self.itemID)
          .set('Authorization', 'Bearer ' + input.token)
          .send({})
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('updates a valid selection', function(done) {
        agent.patch('/' + self.route + '/id/' + self.itemID)
          .set('Authorization', 'Bearer ' + input.token)
          .send(input.patch)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }

  DELETE() {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

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

  DELETEwithToken(token, input) {
    let self = this
    before(async function() { self.logic.connectToDB() })
    after(function() { self.logic.disconnectFromDB() })

    describe('DELETE /' + self.route + '/id/', function() {
      it('rejects an invalid token', function(done) {
        agent.delete('/' + self.route + '/id/-1')
          .expect(401)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('rejects an invalid selection', function(done) {
        agent.delete('/' + self.route + '/id/-1')
          .set('Authorization', 'Bearer ' + token)
          .expect(400)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
      it('accepts a valid selection', function(done) {
        agent.delete('/' + self.route + '/id/' + self.itemID)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err, res) {
            if (err) { console.log(res.body); return done(err) }
            done()
          })
      })
    })
  }
}
