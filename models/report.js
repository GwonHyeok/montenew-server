const mongoose = require('mongoose');

const Report = mongoose.model('Report', {
  title: { type: String, required: true },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }]
});

module.exports = Report;