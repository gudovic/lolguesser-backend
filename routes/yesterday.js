const express = require('express');
const router = express.Router();
const Guess = require('../models/Guesses');


router.get('/', async (req, res) => {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const dateStr = yesterday.toISOString().split('T')[0];

  try {
    const guess = await Guess.findOne({
      createdAt: {
        $gte: new Date(`${dateStr}T00:00:00.000Z`),
        $lt: new Date(`${dateStr}T23:59:59.999Z`)
      }
    });

    if (guess?.targetChamp) {
      return res.json(guess.targetChamp);
    }

    res.status(404).json({ error: 'No champ data for yesterday' });
  } catch (err) {
    console.error('Error fetching yesterday\'s champ:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
