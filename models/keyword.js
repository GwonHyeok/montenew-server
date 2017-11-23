const mongoose = require('mongoose');

const KeyWord = mongoose.model('KeyWord', {
  title: { type: String, required: [true, '키워드 제목이 존재하지 않습니다'] },
  targetUri: { type: String, required: [true, '키워드 타겟 주소가 존재하지 않습니다'] },
  type: { type: String } // 지식쇼핑, 통합검색 ...
});

module.exports = KeyWord;