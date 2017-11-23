const express = require('express');
const router = express.Router();
const passport = require('passport');
const tokenUtil = require('../passport/token');
const AccessToken = require('../models/accessToken');

router.post('/', passport.authenticate('local'), async (req, res) => {
  const signedToken = tokenUtil.signToken(req.user._id);
  const accessToken = new AccessToken({ type: 'Bearer', access_token: signedToken, user_id: req.user._id });
  await accessToken.save();

  res.json({ data: accessToken })
});

module.exports = router;
