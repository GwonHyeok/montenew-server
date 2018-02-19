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
        company: company,
        authority: req.user.authority
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

  const maxCount = keywordLogs.length;
  const limit = req.query.limit || 20;
  const page = req.query.page || 1;
  const maxPage = ((maxCount / limit) | 0) + ((maxCount % limit) ? 1 : 0);

  const results = keywordLogs.slice((limit * (page - 1)), Math.min(limit * page, keywordLogs.length) + 1);
  res.json({ meta: { maxCount, maxPage, limit, page }, data: results });
});

module.exports = router;
