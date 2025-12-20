import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import setupSocketIO from './socket/index.js';

import authRoutes from './routes/auth.js';
import communityRoutes from './routes/communities.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);

// Create HTTP server
const httpServer = http.createServer(app);

// Set up Socket.io on http server
const io = setupSocketIO(httpServer);

// Make io available to routes if needed
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Listen on HTTP server (not app)
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io enabled for real-time messaging`);
});