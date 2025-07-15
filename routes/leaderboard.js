const express = require('express');
const router = express.Router();
const Guess = require('../models/Guesses');

router.get('/', async (req, res) => {
try {
    const pipeline = [
    {
        $group: {
        _id: {
            username: "$username",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        },
        guessesThisDay: { $sum: 1 },
        oneshotThisDay: {
            $sum: { $cond: [{ $lte: ["$guessNumber", 2] }, 1, 0] }
        }
        }
    },
    {
        $group: {
        _id: "$_id.username",
        avgGuesses: { $avg: "$guessesThisDay" },
        totalGames: { $sum: 1 },
        oneshotGames: { $sum: "$oneshotThisDay" }
        }
    },
    {
        $setWindowFields: {
        partitionBy: null,
        sortBy: { avgGuesses: 1 },
        output: {
            avgGuessRank: { $rank: {} }
        }
        }
    },
    {
        $setWindowFields: {
        partitionBy: null,
        sortBy: { oneshotGames: -1 },
        output: {
            oneshotRank: { $rank: {} }
        }
        }
    },
    {
        $project: {
        username: "$_id",
        _id: 0,
        avgGuesses: 1,
        avgGuessRank: 1,
        totalGames: 1,
        oneshotGames: 1,
        oneshotRank: 1
        }
    },
    {
        $sort: { avgGuessRank: 1 }
    }
    ];
    const result = await Guess.aggregate(pipeline);
    res.json(result);
    } catch (err) {
    console.error('❌ Leaderboard aggregation failed:', err);
    res.status(500).json({ error: 'Leaderboard error' });
    } 

    });

    module.exports = router

