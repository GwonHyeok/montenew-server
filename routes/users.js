const express = require('express');
const router = express.Router();

const User = require('../models/user');

/**
 * 유저 생성
 */
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();

  res.json({ data: user });
});

module.exports = router;
