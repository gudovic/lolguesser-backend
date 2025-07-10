const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

const SALT_ROUNDS = 10;

router.post('/signup', async (req, res) => {
    const {username, password} = req.body;

    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(409).json({error: 'Username already taken'});
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({message: 'Signup successful!'});
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({error: 'Server error during signup'});
    }
});

module.exports = router;
