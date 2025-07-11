const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      message: 'Authenticated',
      user: {
        id: decoded.userId,
        username: decoded.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
