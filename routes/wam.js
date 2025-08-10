const express = require('express');
const router = express.Router();
const WamScore = require('../models/Wamscore');

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

router.get('/top', async (req, res) => {
  try {
    const q = (req.query.name || '').trim();
    const normalized = q ? q.toLowerCase() : null;

    const topDocs = await WamScore.find()
      .sort({ high: -1, updatedAt: 1 })
      .limit(10)
      .lean();

    const top = topDocs.map((s, i) => ({
      rank: i + 1,
      name: s.displayName,
      high: s.high,
    }));

    let you = null;
    if (normalized) {
      const userDoc = await WamScore.findOne({ name: normalized }).lean();
      if (userDoc) {
        const rank = await WamScore.countDocuments({ high: { $gt: userDoc.high } }) + 1;
        you = { rank, name: userDoc.displayName, high: userDoc.high };
      }
    }

    res.json({ top, you });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
