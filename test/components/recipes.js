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
})
