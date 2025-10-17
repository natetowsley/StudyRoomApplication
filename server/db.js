import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // loads environment variables from .env file

const { Pool } = pg; // destructure pool from pg

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.on('connect', () => {
    console.log("Connected to PostgreSQL database");
});

export default pool;