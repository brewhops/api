/* global describe */

const Test = require('../CRUD')
const tables = require('../tableNames')
describe('/actions', function() {
  let test = new Test(
    'actions',
    require('../../components/actions/logic'),
    'actions',
    tables
  )
  test.GETall()
  test.POST({
    'name': 'COOL',
    'description': 'Cool it'
  })
  test.GETid()
  test.PATCH({
    'description': 'Cool it down'
  })
  test.DELETE()
})
