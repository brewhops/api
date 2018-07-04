/* global describe it */

// import config info
require('dotenv').config()

const chai = require('chai')
const expect = chai.expect

describe('Database connect', function() {
  it('is using port 32769', function() {
    expect(process.env.PGPORT).to.equal('32769')
  })

  it('is using host localhost', function() {
    expect(process.env.PGHOST).to.equal('localhost')
  })
})
