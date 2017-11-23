const mongoose = require('mongoose');

const Report = mongoose.model('Report', {
  title: { type: String, required: true }
});

module.exports = Report;