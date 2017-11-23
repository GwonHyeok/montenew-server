const LocalStrategy = require('passport-local');
const User = require('../models/user');

function getUser(username) {
  return User.findOne({ username })
}

function comparePassword(user, password) {
  return new Promise((resolve, reject) => {
    if (user === null) return reject(new Error('존재하지 않는 아이디 입니디'));

    user.isValidPassword(password)
      .then(isValid => {
        if (isValid) return resolve(user);
        return reject(new Error('옳바르지 않은 비밀번호 입니다'))
      })
      .catch(error => reject(new Error('로그인에 실패하였습니다')));
  })
}

module.exports = new LocalStrategy(
  {},
  (username, password, done) => {
    getUser(username)
      .then(user => comparePassword(user, password))
      .then(user => done(null, user))
      .catch(e => done(e));
  }
);