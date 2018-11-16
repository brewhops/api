/* global describe */

const Test = require('../CRUD')

describe('/recipes', function() {
  let test = new Test(
    'recipes',
    require('../../components/recipes/logic'),
    'recipes',
    require('../tableNames')
  )
  test.GETall()
  test.POST({
    'name': 'Pacific Rain',
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
