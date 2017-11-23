const BearerStrategy = require('passport-http-bearer').Strategy;
const { verifyAccessToken, decodeToken } = require('./token');
const AccessToken = require('../models/accessToken');
const User = require('../models/user');

module.exports = new BearerStrategy({}, async function(accessToken, done) {

  // 토큰 검색
  const token = await AccessToken.findOne({ access_token: accessToken });
  if (!token) return done(null, false);

  // 해당 토큰이 옳바른지 검증한다
  if (verifyAccessToken(accessToken) === false) return done(null, false);

  // 토큰을 디코딩 한다
  const tokenInfo = decodeToken(accessToken);

  // 유저 정보가 없으면 잘못된 정보
  if (!token.user_id.equals(tokenInfo.user_id)) return done(null, false);

  // 유저 정보
  const user = await User.findOne({ _id: token.user_id });
  done(null, user, { scope: '*' });

});