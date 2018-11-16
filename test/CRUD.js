/* global describe it before after */

/*
A redefinition of the CRUD class used in the production environment.
This is redefined because it is geared towards testing.

The general flow of this class:
1. It creates a connection pool to the database in the test docker environment
2. It creates a connection to that DB using the connection pool
3. It makes a copy of the database in that test docker environment
  a. There is one copy of the DB for every table in the database
  b. These coppies are tracked in a schema with the name of the route. This is
    to keep any other tests from interfering with the test that is running.
  c. The copy is left after the test is run, but is dropped when the test is
    run again.
4. It clears out any data that might exist in those tables.
5. It runs some tests
*/

require('dotenv').config()

// our framework for writing assertion testing
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.should()

// our framework for integration testing
const request = require('supertest')
// our express app
const app = require('../src/index.js')
// super test needs a copy of our app to test
const agent = request.agent(app)

// get our PG javascript wrapper pool
const { Pool } = require('pg')

// this is the pool that we will use to create test schemas
const testPool = new Pool({
  user: process.env.TEST_PG_USER,
  database: process.env.TEST_PG_DATABASE,
  password: process.env.TEST_PG_PASSWORD,
  port: process.env.TEST_PG_PORT,
  host: process.env.TEST_PG_HOST
})

// this is the client we connect and disconnect to the pool with
let client

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
  }

  getRoute() {
    return this.route
  }

  dbSetup() {
    let self = this
    describe(`${self.srcTable} setup`, function() {
      // connect the clients before the test
      before(async function() { client = await testPool.connect() })
      // disconnect when done
      after(function() { client.release() })

      it(`dropped schema ${self.schemaName}`, function(done) {
        client.query(`DROP SCHEMA IF EXISTS ${self.schemaName} CASCADE`)
          .should.be.fulfilled.and.notify(done)
      })
      it(`created schema ${self.schemaName}`, function(done) {
        client.query(`CREATE SCHEMA ${self.schemaName}`)
          .should.be.fulfilled.and.notify(done)
      })
      for (let table of self.tables) {
        it(`coppied ${table} to ${self.schemaName}.${table}`, function(done) {
          client.query(
            `CREATE TABLE ${self.schemaName}.${table}
            (LIKE ${table} INCLUDING ALL)`
          ).should.be.fulfilled.and.notify(done)
        })
        it(`cleared out the ${self.schemaName}.${table} table`, function(done) {
          client.query(`TRUNCATE ${self.schemaName}.${table} CASCADE`)
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

  GETall() {
    let self = this
    before(async function() {
      self.logic.connectToDB()
    })
    after(function() {
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

      it('has one more item in the table', function(done) {
        agent.get('/' + self.route)
          .expect(function(res) {
            res.body.length.should.equal(1)
          })
          .expect(200, done)
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
