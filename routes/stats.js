const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Guess = require('../models/Guesses');

router.get('/', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    const userGuesses = await Guess.find({ username });

    const groupedByDate = {};
    for (const guess of userGuesses) {
      if (!guess.createdAt) {
        console.warn('⚠️ guess.createdAt is missing:', guess);
        continue; 
        }

        const date = new Date(guess.createdAt);
        if (isNaN(date)) {
        console.warn('⚠️ Invalid date:', guess.createdAt);
        continue;
        }

        const dateString = date.toISOString().split('T')[0];
            if (!groupedByDate[dateString]) groupedByDate[dateString] = [];
            groupedByDate[dateString].push(guess);
    }

    const gamesPlayed = Object.keys(groupedByDate).length;
    const totalGuesses = userGuesses.length;
    const avgGuesses = (totalGuesses / gamesPlayed || 0).toFixed(2);
    const oneshots = Object.values(groupedByDate).filter(g => g.length === 2).length;
    const wins = Object.values(groupedByDate).filter(g => g.some(gg => gg.result === 'correct')).length;
    const winRate = (wins / gamesPlayed || 0).toFixed(2);

    const yearDiffs = userGuesses.map(g =>
      Math.abs(g.guessedChamp.releaseYear - g.targetChamp.releaseYear)
    );
    const avgYearDiff = (
      yearDiffs.reduce((sum, d) => sum + d, 0) / (yearDiffs.length || 1)
    ).toFixed(1);
      
    const playedDates = new Set(
      Object.keys(groupedByDate)
    );

    let streak = 0;
    let today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    while (true) {
      const iso = today.toISOString().split('T')[0];
      if (playedDates.has(iso)) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }
    res.status(200).json({
      username,
      totalGuesses,
      gamesPlayed,
      avgGuesses,
      oneshots,
      winRate,
      avgYearDiff,
      streak
    });

  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;

