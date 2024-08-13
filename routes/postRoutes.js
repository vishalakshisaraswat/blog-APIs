const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author_id', 'username');
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author_id', 'username');
        if (!post) return res.status(404).send({ message: 'No post found' });
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Create a new post (protected route)
router.post('/', auth, async (req, res) => {
    const { title, content } = req.body;
    try {
        const post = new Post({ title, content, author_id: req.user.id });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Update a post (protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!post) return res.status(404).send({ message: 'Post not found' });
        res.send(post);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Delete a post (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).send({ message: 'Post not found' });
        res.send({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
