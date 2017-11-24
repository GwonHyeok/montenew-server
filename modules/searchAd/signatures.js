const crypto = require('crypto');

class Signatures {

  static of(timestamp, method, resource, key) {
    return crypto.createHmac('sha256', key)
      .update(`${timestamp}.${method}.${resource}`)
      .digest('base64');
  }

}

module.exports = Signatures;