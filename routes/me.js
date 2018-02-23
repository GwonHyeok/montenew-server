const express = require('express');
const router = express.Router();
const passport = require('passport');
const Company = require('../models/company');
const Keyword = require('../models/keyword');
const KeywordLog = require('../models/keywordLog');
const mongoose = require('mongoose');

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
  const keywordLogs = [];

  for (let i = 0; i < company.keywords.length; i++) {
    const keywordId = company.keywords[i];
    const keywordLog = await KeywordLog.findOne({
      keyword: keywordId
    }).sort({ createdAt: -1 }).populate('keyword');
    if (keywordLog) keywordLogs.push(keywordLog);
  }

  const maxCount = keywordLogs.length;
  const limit = req.query.limit || 20;
  const page = req.query.page || 1;
  const maxPage = ((maxCount / limit) | 0) + ((maxCount % limit) ? 1 : 0);
  const sort = req.query.sort || 'type';

  // Rank 일때 정렬
  if (sort === 'rank') {
    keywordLogs.sort((a, b) => {
      if (a.rank > b.rank) return 1;
      if (a.rank < b.rank) return -1;
      return 0;
    })
  } else {
    keywordLogs.sort((a, b) => {
      if (a.keyword.type > b.keyword.type) return 1;
      if (a.keyword.type < b.keyword.type) return -1;
      return 0;
    })
  }

  const results = keywordLogs.slice((limit * (page - 1)), Math.min(limit * page, keywordLogs.length));
  res.json({ meta: { maxCount, maxPage, limit, page }, data: results });
});

router.get('/keywordLogs/:keyword/chart', passport.authenticate('bearer'), async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json();

  function zeroPad(num, numZeros) {
    const n = Math.abs(num);
    const zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    let zeroString = Math.pow(10, zeros).toString().substr(1);
    if (num < 0) zeroString = '-' + zeroString;

    return zeroString + n;
  }

  const period = req.query.period || 'hourly';
  const periods = ['monthly', 'daily', 'hourly'];
  const aggregateGroup = { year: { $year: "$createdAt" } };
  const aggregateGroups = [
    { month: { $month: { date: "$createdAt", timezone: 'Asia/Seoul' } } },
    { day: { $dayOfMonth: { date: "$createdAt", timezone: 'Asia/Seoul' } } },
    { hour: { $hour: { date: "$createdAt", timezone: 'Asia/Seoul' } } }
  ];

  // hourly 전부
  for (let i = 0; i <= periods.indexOf(period); i++) {
    Object.assign(aggregateGroup, aggregateGroups[i]);
  }

  // 과거 키워드 로그
  const keywordLogs = await KeywordLog.aggregate(
    [
      {
        $match: {
          keyword: mongoose.Types.ObjectId(req.params.keyword)
        }
      },
      {
        $group: {
          _id: aggregateGroup,
          rank: { $avg: "$rank" },
        }
      },
      {
        $sort: Object.keys(aggregateGroup).reduce((previousValue, currentValue) => {
          previousValue[`_id.${currentValue}`] = 1;
          return previousValue
        }, {})
      }
    ]
  );

  res.json({
    data: keywordLogs.map(log => {
      const labels = Object.values(log._id);
      if (labels.length === 4) {
        log.label = `${labels.slice(0, 3).map(value => zeroPad(value, 2)).join('-')} ${zeroPad(labels[3], 2)}:00`
      } else {
        log.label = Object.values(log._id).map(value => zeroPad(value, 2)).join('-');
      }

      return log
    })
  });
});

module.exports = router;
