/* global describe */

const Test = require('../CRUD')
const tables = require('../tableNames')

describe('/employees', async function() {
  let test = new Test(
    'employees',
    require('../../components/employees/logic'),
    'employees',
    tables
  )
  test.GETall()
  test.POST({
    'first_name': 'Connor',
    'last_name': 'Christensen',
    'username': 'diffchriconn',
    'password': 'thisisallyours',
    'phone': '972695553',
    'access_level': 1
  })
})
