  const express = require('express');
  const jwt = require('jsonwebtoken');
  const Guess = require('../models/Guesses');
  const router = express.Router();
  const getDailyChampion = require('./champion')

  router.post('/', async (req, res) => {
    const guessedChamp = req.body;

    const target = getDailyChampion();
    console.log("✅ Guess route hit!");

    if (!target) {
      return res.status(400).json({ error: 'Daily champion not set yet. Call champion first.' });
    }

      let user = null;
    try {
      const token = req.cookies.token;
      if (token) {
        user = jwt.verify(token, process.env.JWT_SECRET);
      }
    } catch (err) {
      console.log("❌ No valid user session found");
    }

    const keys = ['gender', 'position', 'species', 'resource', 'rangeType', 'region', 'releaseYear'];
    const feedback = {};

    for (let key of keys) {
      const guessValue = guessedChamp[key];
      const targetValue = target[key];

      const guessArr = Array.isArray(guessValue) ? [...guessValue].sort() : [guessValue];
      const targetArr = Array.isArray(targetValue) ? [...targetValue].sort() : [targetValue];

      if (key === 'releaseYear') {
        if (guessValue > targetValue) feedback[key] = 'arrowUp';
        else if (guessValue < targetValue) feedback[key] = 'arrowDown';
        else feedback[key] = 'green';
      } else {
        const fullMatch = JSON.stringify(guessArr) === JSON.stringify(targetArr);
        const partialMatch = guessArr.some(val => targetArr.includes(val));

        if (fullMatch) feedback[key] = 'green';
        else if (partialMatch) feedback[key] = 'yellow';
        else feedback[key] = 'red';
      }
    }
    
    const result = guessedChamp.name === target.name ? 'correct' : 'wrong';

      if (user) {
      try {
        const newGuess = new Guess({
          userId: user.userId,
          username: user.username,
          guessedChamp: guessedChamp,
          targetChamp: target
        });
        await newGuess.save();
      } catch (err) {
        console.error('❌ Failed to save guess:', err);
      }
    }

    res.json({ result, feedback });
    
  });

  router.get('/today', async (req, res) => {
    const target = getDailyChampion();
    let user = null;
    try {
      const token = req.cookies.token;
      if (token) {
        user = jwt.verify(token, process.env.JWT_SECRET);
      }
    } catch (err) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (!target) {
      return res.status(400).json({ error: 'No target set today' });
    }

    try {
      const guesses = await Guess.find({
        userId: user.userId,
        'targetChamp.name': target.name,
        timestamp: { $gte: start, $lte: end }
      }).sort({ timestamp: 1 });

  const guessesWithFeedback = guesses.map(g => {
  const guessedChamp = g.guessedChamp;
  const keys = ['gender', 'position', 'species', 'resource', 'rangeType', 'region', 'releaseYear'];
  const feedback = {};

  for (let key of keys) {
    const guessValue = guessedChamp[key];
    const targetValue = target[key];

    const guessArr = Array.isArray(guessValue) ? [...guessValue].sort() : [guessValue];
    const targetArr = Array.isArray(targetValue) ? [...targetValue].sort() : [targetValue];

    if (key === 'releaseYear') {
      if (guessValue > targetValue) feedback[key] = 'arrowUp';
      else if (guessValue < targetValue) feedback[key] = 'arrowDown';
      else feedback[key] = 'green';
    } else {
      const fullMatch = JSON.stringify(guessArr) === JSON.stringify(targetArr);
      const partialMatch = guessArr.some(val => targetArr.includes(val));

      if (fullMatch) feedback[key] = 'green';
      else if (partialMatch) feedback[key] = 'yellow';
      else feedback[key] = 'red';
    }
  }

  const result = guessedChamp.name === target.name ? 'correct' : 'wrong';

  return {
    guessedChamp,
    feedback,
    result
  };
});

res.json({ guesses: guessesWithFeedback });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch guesses' });
    }
  });



  module.exports = router;
