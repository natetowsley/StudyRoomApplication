import express from 'express'; // imports express
const app = express(); // creates an express application
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!'});
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server runing on http://localhost:${PORT}`);
});