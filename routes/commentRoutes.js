const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Post = require('../models/post'); // Import Post model to update comments array
const auth = require('../middleware/auth'); // Ensure auth middleware is used for protected routes

// Get comments for a post
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post_id: req.params.postId }).sort({ createdAt: -1 }).populate('author_id', 'username');
        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get single comment
router.get('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id).populate('author_id', 'username');
        if (!comment) return res.status(404).send('Comment not found');
        res.status(200).send(comment);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create a new comment
router.post('/posts/:postId/comments', auth, async (req, res) => {
    const { postId } = req.params;
    const { content, author_id } = req.body; // Include author_id in request body

    try {
        const comment = new Comment({
            post_id: postId,
            content,
            author_id
        });
        const savedComment = await comment.save();

        // Update the post to include the new comment
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        post.comments.push(savedComment._id);
        await post.save();

        res.status(201).send(savedComment);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update a comment
router.put('/comments/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!comment) return res.status(404).send('Comment not found.');
        res.status(200).send(comment);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findByIdAndRemove(req.params.id);
        if (!comment) return res.status(404).send('Comment not found.');
        res.send({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
