const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.lolgiss.com',
    path: '/'
  });
     res.status(200).json({ message: 'Logged out successfully' });
 });

module.exports = router;