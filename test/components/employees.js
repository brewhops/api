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
})
