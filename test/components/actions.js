/* global describe */

const Test = require('../CRUD')
const tables = require('../tableNames')
let test = new Test(
  'actions',
  require('../../components/actions/logic'),
  'actions',
  tables
)

describe('/' + test.getRoute(), function() {
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
