const Test = require('../CRUD')
let test = new Test(
  'recipes',
  require('../../components/recipes/logic'),
  'recipes',
  require('../tableNames')
)

test.routeTest({
  post: {
    valid: {
      'airplane_code': 'RAIN',
      'instructions': {
        'hops': '1',
        'things': '2'
      }
    }
  }
})
