/* global describe */

const Test = require('../CRUD')
let test = new Test(
  'recipes',
  require('../../components/recipes/logic'),
  'recipes',
  require('../tableNames')
)

describe('/' + test.getRoute(), function() {
  test.GETall()
  test.POST({
    'airplane_code': 'RAIN',
    'instructions': {
      'hops': 1,
      'things': 2
    }
  })
  test.GETid()
  test.PATCH({
    'airplane_code': 'IPA'
  })
  test.DELETE()
})
