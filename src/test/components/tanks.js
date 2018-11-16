/* global describe */

const Test = require('../CRUD')
const tables = require('../tableNames')

describe('/tanks', async function() {
  let test = new Test(
    'tanks',
    require('../../components/tanks/logic'),
    'tanks',
    tables
  )
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
})
