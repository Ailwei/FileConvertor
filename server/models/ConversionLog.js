const mongoose = require('mongoose');

const ConversionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  fileType: { type: String, required: true },
});

const ConversionLog = mongoose.model('ConversionLog', ConversionLogSchema);
module.exports = ConversionLog;
