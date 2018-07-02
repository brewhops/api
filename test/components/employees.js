/* global describe it */

require('dotenv').config()

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.should()

const request = require('supertest')
const app = require('../../index.js')
const agent = request.agent(app)
const Employees = require('../../components/employees/logic')

// connect to the employees table in the test schema
const employees = new Employees('test.employees')

const { Client } = require('pg')
const client = new Client()

async function employeeCountEquals(number) {
  let res = await client.query('SELECT COUNT(*) FROM test.employees')
  return res.rows[0].count
}

describe('/employees', function() {
  describe('Connect client', function() {
    it('logged in', function(done) {
      client.connect().should.be.fulfilled.and.notify(done)
    })
  })

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
      agent.get('/employees/0').expect(400, done)
    })
  })

  describe('GET /employees/id/1', function() {
    it('says that access is denied without a valid token', function(done) {
      agent.get('/employees/id/1').expect(401, done)
    })
  })

  describe('POST /employees', function() {
    it('creates a new user', function(done) {
      agent.post('/employees')
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
    it('added an employee to the table', function() {
      return employeeCountEquals().should.eventually.equal('1')
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
        .expect(400, done)
    })
    it('did not add the duplicate to the table', function() {
      return employeeCountEquals().should.eventually.equal('1')
    })
  })

  let responseToken

  describe('POST /employees/login', function() {
    it('returns a token', function(done) {
      agent
        .post('/employees/login')
        .send({
          'username': 'username',
          'password': 'password'
        })
        .set('Accept', 'application/json')
        .expect(function(res) {
          res.body.token.should.be.a('string')
          responseToken = res.body.token
        })
        .expect(200, done)
    })
  })

  describe('GET /employees/id/1', function() {
    it('should return a user', function(done) {
      agent.get('/employees/id/1')
        // send in the JWT
        .set('Authorization', 'Bearer ' + responseToken)
        .expect(200, done)
    })
  })

  describe('POST /employees', function() {
    it('creates a new different user', function(done) {
      agent
        .post('/employees')
        .send({
          'first_name': 'first',
          'last_name': 'last',
          'username': 'differentusername',
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

  let userID

  describe('GET /employees/', function() {
    it('has two employees', function(done) {
      agent.get('/employees')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(function(res) {
          (res.body.length).should.be.equal(2)
          userID = res.body[0].id
        })
        .expect(200, done)
    })
  })

  describe(`DEL /employees/id/${userID}`, function() {
    it('rejected a delete without a token', function(done) {
      agent.del(`/employees/id/${userID}`)
        .expect(401, done)
    })
    it('deleted the user when given a valid token', function(done) {
      agent.del(`/employees/id/${userID}`)
        .set('Authorization', 'Bearer ' + responseToken)
        .expect(200, done)
    })
    it('has one less employee in the table', function() {
      return employeeCountEquals().should.eventually.equal('1')
    })
  })
})

describe('Database disconnect', function() {
  it('disconnected the employees route', function(done) {
    employees.disconnectFromDB().should.be.fulfilled.and.notify(done)
  })
  it('disconnected from the test database', function(done) {
    client.end().should.be.fulfilled.and.notify(done)
  })
})
