const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register User
router.post('/', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send({ error: 'Invalid email or password' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).send({ error: 'Invalid email or password' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get user profile (protected)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update user (protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Delete user (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ error: 'User not found' });
        res.send({ message: 'User deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
