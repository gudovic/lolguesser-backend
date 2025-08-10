const mongoose = require('mongoose');

const wamVisitSchema = new mongoose.Schema({
  uuid: { type: String, unique: true },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WamVisit', wamVisitSchema);