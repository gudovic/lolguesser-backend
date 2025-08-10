const express = require('express');
const router = express.Router();
const WamScore = require('../models/WamScore');

router.post('/', async (req, res) => {
  try {
    let { name, score } = req.body;
    if (typeof name !== 'string' || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    const displayName = name.trim();
    const normalized = displayName.toLowerCase();

    const updated = await WamScore.findOneAndUpdate(
      { name: normalized },
      {
        $setOnInsert: { name: normalized, displayName },
        $max: { high: score }
      },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, high: updated.high, name: updated.displayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/top/:name', async (req, res) => {
  try {
    const displayName = req.params.name.trim();
    const normalized = displayName.toLowerCase();

    // Get top 10
    const top = await WamScore.find()
      .sort({ high: -1, updatedAt: 1 })
      .limit(10)
      .lean();

    // Find user's rank & score
    const userDoc = await WamScore.findOne({ name: normalized }).lean();
    let userRank = null;
    if (userDoc) {
      userRank = await WamScore.countDocuments({
        high: { $gt: userDoc.high }
      }) + 1; // rank = #people above + 1
    }

    res.json({
      top: top.map((s, i) => ({
        rank: i + 1,
        name: s.displayName,
        high: s.high
      })),
      you: userDoc
        ? {
            rank: userRank,
            name: userDoc.displayName,
            high: userDoc.high
          }
        : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
