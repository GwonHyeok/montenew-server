const mongoose = require('mongoose');

const Company = mongoose.model('Company', {
  name: { type: String, required: [true, '회사 이름이 존재하지 않습니다'], unique: true },
  keywords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KeyWord' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
  medias: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }]
});

module.exports = Company;