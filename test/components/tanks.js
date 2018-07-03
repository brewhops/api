/* global describe */

const Test = require('../CRUD')
const tables = require('../tableNames')
let test = new Test(
  'tanks',
  require('../../components/tanks/logic'),
  'tanks',
  tables
)

describe('/' + test.getRoute(), async function() {
  test.GETall()
  test.POST({
    'name': 'F1',
    'status': 'OK',
    'in_use': true
  })
  test.GETid()
  test.PATCH({
    'status': 'Broken'
  })

  // test.DELETE()
})
