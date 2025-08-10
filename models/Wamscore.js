const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true }, 
  high: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('WamScore', scoreSchema);