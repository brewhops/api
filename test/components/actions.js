const Test = require('../CRUD')
const tables = require('../tableNames')
let test = new Test(
  'actions',
  require('../../components/actions/logic'),
  'actions',
  tables
)

test.routeTest({
  post: {
    valid: {
      'name': 'COOL',
      'description': 'Cool it'
    }
  }
})
