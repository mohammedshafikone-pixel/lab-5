require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// Test connection
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ message: 'MySQL Connected Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM CATEGORY ORDER BY name'
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.1 Search Books (Prepared Statements)
app.get('/api/search', async (req, res) => {
    try {
        const {
            keyword = '',
            minPrice = 0,
            maxPrice = 999999,
            categoryId = 'all'
        } = req.query;

        const min = Number(minPrice);
        const max = Number(maxPrice);

        if (!Number.isFinite(min) ||
            !Number.isFinite(max) ||
            min > max) {
            return res.status(400).json({
                error: 'Invalid price range'
            });
        }

        let sql = `
            SELECT
                b.book_id,
                b.title,
                b.price,
                a.name AS author,
                p.name AS publisher,
                c.name AS category
            FROM BOOK b
            JOIN AUTHOR a ON b.author_id = a.author_id
            JOIN PUBLISHER p ON b.publisher_id = p.publisher_id
            JOIN CATEGORY c ON b.category_id = c.category_id
            WHERE b.title LIKE ?
            AND b.price BETWEEN ? AND ?
        `;

        const values = [
            `%${keyword}%`,
            min,
            max
        ];

        if (categoryId !== 'all') {
            sql += ' AND b.category_id = ?';
            values.push(Number(categoryId));
        }

        sql += ' ORDER BY b.price ASC';

        const [rows] = await db.execute(sql, values);

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.2 Catalogue
app.get('/api/catalogue', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                b.book_id,
                b.title,
                b.price,
                b.publish_year,
                a.name AS author,
                p.name AS publisher,
                c.name AS category
            FROM BOOK b
            JOIN AUTHOR a ON b.author_id = a.author_id
            JOIN PUBLISHER p ON b.publisher_id = p.publisher_id
            JOIN CATEGORY c ON b.category_id = c.category_id
            ORDER BY b.title
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.3 (a) Category Reports
app.get('/api/reports/categories', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                c.name AS category,
                COUNT(b.book_id) AS total_books,
                ROUND(AVG(b.price), 2) AS average_price
            FROM CATEGORY c
            LEFT JOIN BOOK b
            ON c.category_id = b.category_id
            GROUP BY c.category_id, c.name
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.3 (b) Authors with at least 2 books
app.get('/api/reports/authors', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                a.name,
                COUNT(b.book_id) AS total_books
            FROM AUTHOR a
            JOIN BOOK b
            ON a.author_id = b.author_id
            GROUP BY a.author_id, a.name
            HAVING COUNT(b.book_id) >= 2
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.3 (c) Library Price Statistics
app.get('/api/reports/prices', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                SUM(price) AS total_price,
                MIN(price) AS minimum_price,
                MAX(price) AS maximum_price
            FROM BOOK
        `);

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.4 (a) Unreturned Loans
app.get('/api/loans/active', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                l.loan_id,
                b.title,
                m.name AS member,
                l.loan_date
            FROM LOAN l
            JOIN BOOK b ON l.book_id = b.book_id
            JOIN MEMBER m ON l.member_id = m.member_id
            WHERE l.return_date IS NULL
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.4 (b) Members who never borrowed
app.get('/api/loans/no-members', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*
            FROM MEMBER m
            LEFT JOIN LOAN l
            ON m.member_id = l.member_id
            WHERE l.loan_id IS NULL
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.4 (c) Books never borrowed
app.get('/api/loans/no-books', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT b.*
            FROM BOOK b
            LEFT JOIN LOAN l
            ON b.book_id = l.book_id
            WHERE l.loan_id IS NULL
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.5 (a) Top 3 Most Borrowed Books
app.get('/api/most-borrowed/books', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                b.title,
                COUNT(l.loan_id) AS total_loans
            FROM BOOK b
            JOIN LOAN l
            ON b.book_id = l.book_id
            GROUP BY b.book_id, b.title
            ORDER BY total_loans DESC
            LIMIT 3
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.5 (b) Member with most loans
app.get('/api/most-borrowed/members', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                m.name,
                COUNT(l.loan_id) AS total_loans
            FROM MEMBER m
            JOIN LOAN l
            ON m.member_id = l.member_id
            GROUP BY m.member_id, m.name
            ORDER BY total_loans DESC
            LIMIT 1
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.6 (a) All Authors including authors with 0 books
app.get('/api/authors', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                a.author_id,
                a.name,
                a.country,
                COUNT(b.book_id) AS total_books
            FROM AUTHOR a
            LEFT JOIN BOOK b
            ON a.author_id = b.author_id
            GROUP BY a.author_id, a.name, a.country
            ORDER BY a.name
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// F2.6 (b) Author and Publisher from same country
app.get('/api/authors/same-country', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                b.title,
                a.name AS author,
                p.name AS publisher,
                a.country
            FROM BOOK b
            JOIN AUTHOR a
            ON b.author_id = a.author_id
            JOIN PUBLISHER p
            ON b.publisher_id = p.publisher_id
            WHERE a.country = p.country
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Library website running at http://localhost:${PORT}`);
});