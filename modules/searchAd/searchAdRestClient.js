const rp = require('request-promise');
const Signatures = require('./signatures');

class SearchAdRestClient {

  constructor(customerId, apiKey, apiSecret) {
    this.SERVICE_URI = 'https://api.naver.com';
    this.CUSTOMER_ID = customerId;
    this.API_KEY = apiKey;
    this.API_SECRET = apiSecret;
    this.defaultOptions = { json: true }
  }

  request(options) {
    const genOptions = Object.assign({}, this.defaultOptions, options, {
      uri: `${this.SERVICE_URI}${options.endPoint}`
    });

    // Signatures 생성
    const timestamp = Date.now();
    const signatures = Signatures.of(timestamp, genOptions.method, genOptions.endPoint, this.API_SECRET);

    // options 헤더 업데이트
    genOptions.headers = {
      'X-Timestamp': timestamp,
      'X-API-KEY': this.API_KEY,
      'X-Customer': this.CUSTOMER_ID,
      'X-Signature': signatures
    };

    return rp(genOptions)
  }

}

module.exports = SearchAdRestClient;