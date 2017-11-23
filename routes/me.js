const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', function(req, res) {
  res.json({ data: req.user })
});

module.exports = router;
