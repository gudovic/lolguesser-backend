const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');


router.post('/', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({username});
        if (!user) {
            console.log('❌ No user found with username:', username);
            return res.status(400).json({error: 'Invalid username or password'})
        } 
    console.log('✅ User found:', user.username);
    console.log('👉 Input password:', password);
    console.log('🔐 Stored hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('🔍 Password match?', isMatch);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }
        const payload = {
            userId: user._id,
            username: user.username
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });

    res.status(200).json({ message: 'Login successful', username: user.username });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;