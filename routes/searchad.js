const express = require('express');
const router = express.Router();

// 네이버 광고 API 클라이언트
const SearchAdRestClient = require('../modules/searchAd/searchAdRestClient');
const searchAdHttpClient = new SearchAdRestClient(
  process.env.SEARCHAD_CUSTOMER_ID,
  process.env.SEARCHAD_API_KEY,
  process.env.SEARCHAD_API_SECRET
);

router.get('/keywordstool', async function(req, res) {
  const result = await searchAdHttpClient.request(req.searchAdOptions);
  res.json({ data: result })
});


module.exports = router;
