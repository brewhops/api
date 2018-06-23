/* global describe it */
const request = require('supertest')
const app = require('../../index.js')

describe('GET /employees', function () {
  it('should respond with json', function (done) {
    request(app)
      .get('/employees')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })
})
