const mongoose = require('mongoose');

const Solution = mongoose.model('Solution', {
  title: { type: String, required: true }
});

module.exports = Solution;