/* global describe it */

// import config info
import dotenv from 'dotenv';
import chai, { expect } from 'chai';


describe('Database connect', function() {
  it('is using port 45758', function() {
    expect(process.env.TEST_PG_PORT).to.equal('45758')
  })

  it('is using host localhost', function() {
    expect(process.env.TEST_PG_HOST).to.equal('localhost')
  })
})