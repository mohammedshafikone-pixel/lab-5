require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_lab4',
  waitForConnections: true,
  connectionLimit: 10
});

const queries = {
  'F2.1': `SELECT title, price, (SELECT AVG(price) FROM BOOK) AS library_average_price
           FROM book_details
           WHERE price > (SELECT AVG(price) FROM BOOK)
           ORDER BY price DESC`,
  'F2.2a': `SELECT b.book_id, b.title, b.price FROM BOOK b
            WHERE NOT EXISTS (SELECT 1 FROM LOAN l WHERE l.book_id = b.book_id)
            ORDER BY b.book_id`,
  'F2.2b': `SELECT m.member_id, m.name, m.email FROM MEMBER m
            WHERE NOT EXISTS (SELECT 1 FROM LOAN l WHERE l.member_id = m.member_id)
            ORDER BY m.member_id`,
  'F2.3a': `SELECT category_name, title, price FROM book_details bd
            WHERE price = (SELECT MAX(bd2.price) FROM book_details bd2
                           WHERE bd2.category_id = bd.category_id)
            ORDER BY category_name, title`,
  'F2.3b': `SELECT category_name, title, price FROM book_details bd
            WHERE price > (SELECT AVG(bd2.price) FROM book_details bd2
                           WHERE bd2.category_id = bd.category_id)
            ORDER BY category_name, price DESC`,
  'F2.4a': `SELECT m.member_id, m.name, x.loan_count,
                   (SELECT AVG(y.loan_count) FROM
                     (SELECT m2.member_id, COUNT(l2.loan_id) loan_count
                      FROM MEMBER m2 LEFT JOIN LOAN l2 ON l2.member_id=m2.member_id
                      GROUP BY m2.member_id) y) average_loans_per_member
            FROM MEMBER m JOIN
              (SELECT m1.member_id, COUNT(l1.loan_id) loan_count
               FROM MEMBER m1 LEFT JOIN LOAN l1 ON l1.member_id=m1.member_id
               GROUP BY m1.member_id) x ON x.member_id=m.member_id
            WHERE x.loan_count >
              (SELECT AVG(y.loan_count) FROM
                (SELECT m2.member_id, COUNT(l2.loan_id) loan_count
                 FROM MEMBER m2 LEFT JOIN LOAN l2 ON l2.member_id=m2.member_id
                 GROUP BY m2.member_id) y)
            ORDER BY x.loan_count DESC`,
  'F2.4b': `SELECT a.author_id, a.name, a.country FROM AUTHOR a
            WHERE EXISTS (SELECT 1 FROM BOOK b JOIN LOAN l ON l.book_id=b.book_id
                          WHERE b.author_id=a.author_id) ORDER BY a.name`,
  'F2.5a': `SELECT b.book_id, b.title, COUNT(r.review_id) number_of_reviews,
                   COALESCE(AVG(r.rating),0) average_rating,
                   CASE WHEN COUNT(r.review_id)=0 THEN 'No review'
                        WHEN AVG(r.rating)>=4.5 THEN 'Excellent'
                        WHEN AVG(r.rating)>=3.5 THEN 'Good'
                        ELSE 'Fair' END review_label
            FROM BOOK b LEFT JOIN REVIEW r ON r.book_id=b.book_id
            GROUP BY b.book_id,b.title ORDER BY b.book_id`,
  'F2.5b': `SELECT b.book_id,b.title,AVG(r.rating) average_rating
            FROM BOOK b JOIN REVIEW r ON r.book_id=b.book_id
            GROUP BY b.book_id,b.title
            HAVING AVG(r.rating)>(SELECT AVG(r2.rating) FROM REVIEW r2)
            ORDER BY average_rating DESC`,
  'F2.6a': `SELECT country FROM AUTHOR UNION SELECT country FROM PUBLISHER ORDER BY country`,
  'F2.6b': `SELECT country FROM AUTHOR INTERSECT SELECT country FROM PUBLISHER ORDER BY country`,
  'F2.6c': `SELECT country FROM AUTHOR EXCEPT SELECT country FROM PUBLISHER ORDER BY country`,
  'F2.6d': `SELECT name, person_type FROM
              (SELECT a.name, 'Author' person_type FROM AUTHOR a
               UNION ALL SELECT m.name, 'Member' person_type FROM MEMBER m) people
            ORDER BY name, person_type`
};

app.get('/api/:page', async (req, res) => {
  const sql = queries[req.params.page];
  if (!sql) return res.status(404).json({ error: 'Unknown page' });
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'connected', database: process.env.DB_NAME || 'library_lab4' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lab 5 Part II website running at http://localhost:${PORT}`));
