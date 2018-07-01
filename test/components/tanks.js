const Test = require('../CRUD')
const tables = require('../tableNames')
let test = new Test(
  'tanks',
  require('../../components/tanks/logic'),
  'tanks',
  tables
)

test.routeTest({
  post: {
    valid: {
      'name': 'F1',
      'status': 'OK',
      'in_use': true
    }
  }
})
