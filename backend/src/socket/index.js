import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Set up Socke.io on existing Express server
function setupSocketIO(httpServer) {
    // Create Socket.io server with CORS (allows frontend to connect)
    const io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware: Authenticate every socket connection with JWT
    // Runs before socket connects, rejects if token is invalid
    io.use((socket, next) => {
        // Token sent by client
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            // Verify JWT token (same secret as REST API)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user info to socket object
            socket.userId = decoded.userId;
            socket.username = decoded.username;

            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Handle new socket connection
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.username} (ID: ${socket.userId})`);

        // Event: User joins a channel (subscribes to that channel's messages)
        socket.on('join_channel', (channelId) => {
            // Join Socket.io room named after channel ID
            socket.join(`channel_${channelId}`);
            console.log(`${socket.username} joined channel ${channelId}`);
        });

        // Event: User leaves a channel (unsubscribes)
        socket.on('leave_channel', (channelId) => {
            socket.leave(`channel_${channelId}`);
            console.log(`${socket.username} left channel ${channelId}`);
        });

        // Event: User sends a message
        socket.on('send_message', async ({ channelId, content }) => {
            try {
                // Save message to database
                const db = require('../db');
                const result = await db.query(
                    `INSERT INTO messages (channel_id, user_id, content)
                    VALUES ($1, $2, $3)
                    RETURNING id, channel_id, user_id, content, created_at`,
                    [channelId, socket.userId, content]
                );

                const message = result.rows[0];

                // Broadcast message to everyone in channel's room (including sender)
                io.to(`channel_${channelId}`).emit('new_message', {
                    id: message_id,
                    channelId: message.channel_id,
                    userId: socket.userId,
                    username: socket.username,
                    content: message.content,
                    createdAt: message.createdAt
                });
            } catch (error) {
                console.error('Error sending message: ', error);
                // Send error back to sender only
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle disconnection
        socket.on('disconect', () => {
            console.log(`User disconnected: ${socket.username}`);
        });
    });

    return io;
}

export default setupSocketIO;