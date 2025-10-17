import express from 'express'; // imports express
import pool from './db.js'; // import our database pool

const app = express(); // creates an express application
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!'});
});

app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            message: 'Database connected!',
            timestamp: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server runing on http://localhost:${PORT}`);
});