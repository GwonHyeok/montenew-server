const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccessToken = mongoose.model('AccessToken', {
  user_id: Schema.Types.ObjectId,
  type: String,
  access_token: String
});

module.exports = AccessToken;