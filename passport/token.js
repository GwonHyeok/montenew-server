const jwt = require('jsonwebtoken');
const secret = 'token_secret_temporary';

function signToken(id) {
  return jwt.sign({ user_id: id }, secret);
}

function decodeToken(accessToken) {
  return jwt.decode(accessToken);
}

function verifyAccessToken(accessToken) {
  try {
    jwt.verify(accessToken, secret);
    return true
  } catch (e) {
    return false;
  }
}

module.exports.signToken = signToken;
module.exports.decodeToken = decodeToken;
module.exports.verifyAccessToken = verifyAccessToken;