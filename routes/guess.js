const express = require('express');
const router = express.Router();

router.post('/test', (req, res) => {
  res.json({ result: 'correct', feedback: {} }); // dummy test
});

router.post('/', (req, res) => {
  const guessedChamp = req.body;
  const target = req.app.locals.targetChampion;

  console.log("✅ Guess route hit!");

  if (!target) {
    return res.status(400).json({ error: 'Daily champion not set yet. Call champion first.' });
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

  res.json({ result, feedback });
});

module.exports = router;
