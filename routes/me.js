const express = require('express');
const router = express.Router();
const passport = require('passport');
const Company = require('../models/company');
const Keyword = require('../models/keyword');
const KeywordLog = require('../models/keywordLog');

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

router.get('/keywordLogs', passport.authenticate('bearer'), async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json();

  const company = await Company.findById(req.user.company);
  const keywordLogs = await KeywordLog.find({
    $and: [
      {
        $or: company.keywords.map(keyword => {
          return { keyword: keyword }
        })
      },
    ]
  }).populate('keyword');

  res.json({ meta: { count: keywordLogs.length }, data: keywordLogs });
});

module.exports = router;
