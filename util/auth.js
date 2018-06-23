// Match user token against the value that was pulled from DB
function userMatchAuthToken (token, dbUser) {
  if (token === dbUser) {
    return true
  } else {
    return false
  }
}

exports.userMatchAuthToken = userMatchAuthToken
