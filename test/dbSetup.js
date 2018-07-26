/* global describe it */

// import config info
require('dotenv').config()

const chai = require('chai')
const expect = chai.expect

// these tests are to make sure the user set up the .env file correctly.
describe('Database connect', function() {
  it('is using port 45758', function() {
    expect(process.env.TEST_PG_PORT).to.equal('45758')
  })

  it('is using host localhost', function() {
    expect(process.env.TEST_PG_HOST).to.equal('localhost')
  })
})
