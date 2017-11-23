const User = require('../models/user');

module.exports = (id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(e => done(e));
};