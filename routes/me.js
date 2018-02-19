const express = require('express');
const router = express.Router();
const passport = require('passport');
const Company = require('../models/company');

router.get('/', passport.authenticate('bearer'), async (req, res) => {
  if (req.isAuthenticated()) {
    const company = await Company.findById(req.user.company);
    return res.status(200).json({
      data: {
        name: req.user.name,
        username: req.user.username,
        company: company
      }
    });
  }

  res.status(401).json({ error: 'is not authorized' })
});

module.exports = router;
