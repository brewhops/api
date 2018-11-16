/* global describe */

const Test = require('../CRUD')

describe('/batches', function() {
  let test = new Test(
    'batches',
    require('../../components/batches/logic'),
    'batches',
    require('../tableNames')
  )
  test.GETall()
})
