const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


