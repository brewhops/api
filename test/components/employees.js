/* global describe it */

require('dotenv').config()

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
chai.should()

const request = require('supertest')
const app = require('../../index.js')
const agent = request.agent(app)
const Employees = require('../../components/employees/logic')

// connect to the employees table in the test schema
const employees = new Employees('test.employees')

const { Client } = require('pg')
const client = new Client()

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

  describe('copy the employee table schema from the production schema', function() {
    it('coppied the employee schema', function(done) {
      client.query(
        `CREATE TABLE test.employees AS SELECT * FROM employees`
      ).should.be.fulfilled.and.notify(done)
    })
  })

  describe('check correct employees object setup', function() {
    it('has the right db', function() {
      expect(employees.dbName()).to.equal(process.env.PGDATABASE)
    })
    it('has the right table', function() {
      expect(employees.tableName()).to.equal('test.employees')
    })
  })
})

describe('/employees', function() {
  describe('Connect employees route', function() {
    it('connected to the database', function(done) {
      employees.connectToDB().should.be.fulfilled.and.notify(done)
    })
  })

  describe('GET /employees', function() {
    it('responds with json and a 200 code', function(done) {
      agent.get('/employees')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })
  })

  describe('GET /employees/0', function() {
    it('says that route does not exist', function(done) {
      agent.get('/employees/0')
        .expect(400, done)
    })
  })

  describe('GET /employees/id/0', function() {
    it('says that access is denied without a valid token', function(done) {
      agent.get('/employees/id/0')
        .expect(401, done)
    })
  })

  describe('Check contents of employees table', function() {
    it('is empty', async function() {
      let res = await client.query('SELECT COUNT(*) FROM employees')
      expect(res.rows[0].count).to.equal('0')
    })
  })

  describe('POST /employees', function() {
    it('creates a new user', function(done) {
      agent
        .post('/employees')
        .send({
          'first_name': 'first',
          'last_name': 'last',
          'username': 'username',
          'password': 'password',
          'phone': 'phone',
          'access_level': 1
        })
        .expect(201)
        .end(function(err, res) {
          if (err) {
            console.log(res)
            return done(err)
          }
          done()
        })
    })
  })

  describe('Disconnect from DB', function() {
    it('disconnected the employees route', function(done) {
      employees.disconnectFromDB().should.be.fulfilled.and.notify(done)
    })
    it('disconnected from the test database', function(done) {
      client.end().should.be.fulfilled.and.notify(done)
    })
  })
})
