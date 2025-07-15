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
    
    // Streak
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
    // 7 last games
    const lastGames = Object.entries(groupedByDate)
      .sort((a, b) => new Date(b[0]) - new Date(a[0])) 
      .slice(0, 7) 
      .map(([date, guesses]) => ({
        date,
        guessCount: guesses.length
      }))
      .reverse(); 
    // Accuracy 
    const total = userGuesses.length;
      let genderCorrect = 0;
      let regionCorrect = 0;
      let positionCorrect = 0;
      let speciesCorrect = 0;

      userGuesses.forEach(g => {
        if (g.guessedChamp.gender === g.targetChamp.gender) genderCorrect++;
        if (g.guessedChamp.region === g.targetChamp.region) regionCorrect++;
        if (g.guessedChamp.position === g.targetChamp.position) positionCorrect++;
        if (g.guessedChamp.species === g.targetChamp.species) speciesCorrect++;
      });

      const accuracy = {
        gender: ((genderCorrect / total) * 100).toFixed(0),
        region: ((regionCorrect / total) * 100).toFixed(0),
        position: ((positionCorrect / total) * 100).toFixed(0),
        species: ((speciesCorrect / total) * 100).toFixed(0),
      };
      // Global accuracy
      const allGuesses = await Guess.find(); 
      const globalTotal = allGuesses.length;

      let globalGenderCorrect = 0;
      let globalRegionCorrect = 0;
      let globalPositionCorrect = 0;
      let globalSpeciesCorrect = 0;

      allGuesses.forEach(g => {
        if (g.guessedChamp.gender === g.targetChamp.gender) globalGenderCorrect++;
        if (g.guessedChamp.region === g.targetChamp.region) globalRegionCorrect++;
        if (g.guessedChamp.position === g.targetChamp.position) globalPositionCorrect++;
        if (g.guessedChamp.species === g.targetChamp.species) globalSpeciesCorrect++;
      });

      const globalAccuracy = {
        gender: ((globalGenderCorrect / globalTotal) * 100).toFixed(0),
        region: ((globalRegionCorrect / globalTotal) * 100).toFixed(0),
        position: ((globalPositionCorrect / globalTotal) * 100).toFixed(0),
        species: ((globalSpeciesCorrect / globalTotal) * 100).toFixed(0),
      };

    res.status(200).json({
      username,
      totalGuesses,
      gamesPlayed,
      avgGuesses,
      oneshots,
      winRate,
      avgYearDiff,
      streak,
      lastGames,
      accuracy,
      globalAccuracy
    });

  } catch (err) {
    console.error('❌ Stats error:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;

