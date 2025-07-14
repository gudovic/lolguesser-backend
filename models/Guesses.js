const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  guessedChamp: { type: Object, required: true },
  targetChamp: { type: Object, required: true },
  result: { type: String, enum: ['correct', 'incorrect'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Guess', guessSchema);