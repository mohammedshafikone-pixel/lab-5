-- Lab 5 - Part II - Queries for website pages F2.1 to F2.6
USE library_lab4;

-- F2.1 Above the average (scalar subquery).
-- BONUS: use book_details rather than repeating the catalogue joins.
SELECT
    title,
    price,
    (SELECT AVG(price) FROM BOOK) AS library_average_price
FROM book_details
WHERE price > (SELECT AVG(price) FROM BOOK)
ORDER BY price DESC;

-- F2.2 Never borrowed.
-- (a) Books that were never borrowed.
SELECT b.book_id, b.title, b.price
FROM BOOK b
WHERE NOT EXISTS (
    SELECT 1
    FROM LOAN l
    WHERE l.book_id = b.book_id
)
ORDER BY b.book_id;

-- (b) Members who never borrowed a book.
SELECT m.member_id, m.name, m.email
FROM MEMBER m
WHERE NOT EXISTS (
    SELECT 1
    FROM LOAN l
    WHERE l.member_id = m.member_id
)
ORDER BY m.member_id;

-- F2.3 Best of the category (correlated subquery).
-- (a) The most expensive book(s) in each category.
-- BONUS: use book_details.
SELECT category_name, title, price
FROM book_details bd
WHERE price = (
    SELECT MAX(bd2.price)
    FROM book_details bd2
    WHERE bd2.category_id = bd.category_id
)
ORDER BY category_name, title;

-- (b) Books more expensive than the average price of their own category.
SELECT category_name, title, price
FROM book_details bd
WHERE price > (
    SELECT AVG(bd2.price)
    FROM book_details bd2
    WHERE bd2.category_id = bd.category_id
)
ORDER BY category_name, price DESC;

-- F2.4 Active members (derived table, EXISTS).
-- (a) Average number of loans per member (members with zero loans count),
-- then members whose number of loans is greater than that average.
SELECT AVG(member_loan_counts.loan_count) AS average_loans_per_member
FROM (
    SELECT m.member_id, COUNT(l.loan_id) AS loan_count
    FROM MEMBER m
    LEFT JOIN LOAN l ON l.member_id = m.member_id
    GROUP BY m.member_id
) AS member_loan_counts;

SELECT
    m.member_id,
    m.name,
    member_loan_counts.loan_count,
    (SELECT AVG(all_counts.loan_count)
     FROM (
         SELECT m2.member_id, COUNT(l2.loan_id) AS loan_count
         FROM MEMBER m2
         LEFT JOIN LOAN l2 ON l2.member_id = m2.member_id
         GROUP BY m2.member_id
     ) AS all_counts) AS average_loans_per_member
FROM MEMBER m
JOIN (
    SELECT m1.member_id, COUNT(l1.loan_id) AS loan_count
    FROM MEMBER m1
    LEFT JOIN LOAN l1 ON l1.member_id = m1.member_id
    GROUP BY m1.member_id
) AS member_loan_counts ON member_loan_counts.member_id = m.member_id
WHERE member_loan_counts.loan_count > (
    SELECT AVG(all_counts.loan_count)
    FROM (
        SELECT m2.member_id, COUNT(l2.loan_id) AS loan_count
        FROM MEMBER m2
        LEFT JOIN LOAN l2 ON l2.member_id = m2.member_id
        GROUP BY m2.member_id
    ) AS all_counts
)
ORDER BY member_loan_counts.loan_count DESC;

-- (b) Authors who have at least one book that was borrowed.
SELECT a.author_id, a.name, a.country
FROM AUTHOR a
WHERE EXISTS (
    SELECT 1
    FROM BOOK b
    JOIN LOAN l ON l.book_id = b.book_id
    WHERE b.author_id = a.author_id
)
ORDER BY a.name;

-- F2.5 Reviews (LEFT JOIN, CASE, COALESCE, HAVING).
-- (a) Every book, including books with no review.
SELECT
    b.book_id,
    b.title,
    COUNT(r.review_id) AS number_of_reviews,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    CASE
        WHEN COUNT(r.review_id) = 0 THEN 'No review'
        WHEN AVG(r.rating) >= 4.5 THEN 'Excellent'
        WHEN AVG(r.rating) >= 3.5 THEN 'Good'
        ELSE 'Fair'
    END AS review_label
FROM BOOK b
LEFT JOIN REVIEW r ON r.book_id = b.book_id
GROUP BY b.book_id, b.title
ORDER BY b.book_id;

-- (b) Books whose average rating is higher than the average of all ratings.
SELECT
    b.book_id,
    b.title,
    AVG(r.rating) AS average_rating
FROM BOOK b
JOIN REVIEW r ON r.book_id = b.book_id
GROUP BY b.book_id, b.title
HAVING AVG(r.rating) > (SELECT AVG(r2.rating) FROM REVIEW r2)
ORDER BY average_rating DESC;

-- F2.6 Countries and people (UNION, INTERSECT, EXCEPT).
-- (a) Countries of authors and publishers, each country once.
SELECT country FROM AUTHOR
UNION
SELECT country FROM PUBLISHER
ORDER BY country;

-- (b) Countries that have both an author and a publisher.
SELECT country FROM AUTHOR
INTERSECT
SELECT country FROM PUBLISHER
ORDER BY country;

-- (c) Countries that have an author but no publisher.
SELECT country FROM AUTHOR
EXCEPT
SELECT country FROM PUBLISHER
ORDER BY country;

-- (d) One list of author names and member names, with a type, sorted by name.
SELECT name, person_type
FROM (
    SELECT a.name AS name, 'Author' AS person_type
    FROM AUTHOR a
    UNION ALL
    SELECT m.name AS name, 'Member' AS person_type
    FROM MEMBER m
) AS people
ORDER BY name, person_type;
