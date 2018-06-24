/* global describe it */
const request = require('supertest')
const app = require('../../index.js')
const agent = request.agent(app)

describe('/employees', function () {
  describe('GET /employees', function () {
    it('should respond with json', function (done) {
      agent.get('/employees')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })
  })

  describe('GET /employees/0', function () {
    it('should say that route does not exist', function (done) {
      agent.get('/employees/0')
        .expect(400, done)
    })
  })

  describe('GET /employees/id/0', function () {
    it('should say that access is denied without a valid token', function (done) {
      agent.get('/employees/id/0')
        .expect(401, done)
    })
  })

  describe('POST /employees', function () {
    it('should create a new user', function (done) {
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
        .end(function (err, res) {
          if (err) {
            console.log(res)
            return done(err)
          }
          done()
        })
    })
  })
})
