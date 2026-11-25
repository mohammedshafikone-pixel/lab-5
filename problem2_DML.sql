USE library_lab4;

-- =================================
-- 1. Insert Authors
-- =================================

INSERT INTO AUTHOR (name,country) VALUES
('Ahmed Khaled Tawfik','Egypt'),
('Naguib Mahfouz','Egypt'),
('Agatha Christie','United Kingdom'),
('George Orwell','United Kingdom'),
('J.K. Rowling','United Kingdom');


-- =================================
-- 2. Insert Publishers
-- =================================

INSERT INTO PUBLISHER (name, country) VALUES
('Dar El Shorouk', 'Egypt'),
('Penguin Books', 'United Kingdom'),
('HarperCollins', 'United States');


-- =================================
-- 3. Insert Categories
-- =================================

INSERT INTO CATEGORY (name) VALUES
('Novel'),
('Mystery'),
('Science Fiction'),
('History');


-- =================================
-- 4. Insert Books
-- =================================

INSERT INTO BOOK
(title, price, publish_year, author_id, publisher_id, category_id)
VALUES
('Utopia', 18.50, 2008, 1, 1, 3),
('The Blue Elephant', 25.00, 2012, 1, 1, 2),
('Palace Walk', 32.00, 1956, 2, 1, 1),
('The Thief and the Dogs', 16.00, 1961, 2, 2, 1),
('Murder on the Orient Express', 22.00, 1934, 3, 2, 2),
('And Then There Were None', 19.75, 1939, 3, 2, 2),
('Animal Farm', 14.00, 1945, 4, 3, 3),
('Nineteen Eighty-Four', 28.00, 1949, 4, 3, 3),
('The Silent Library',12,2020,1,3,1),
('The Lost Manuscript', 35.00, 2022, 1, 2, 4);


-- =================================
-- 5. Insert Members
-- =================================

INSERT INTO MEMBER (name, email, join_date) VALUES
('Mariam Ali', 'mariam@example.com', '2026-01-10'),
('Omar Hassan', 'omar@example.com', '2026-02-15'),
('Salma Adel', 'salma@example.com', '2026-03-01'),
('Youssef Samir', 'youssef@example.com', '2026-04-20'),
('Nour Ahmed', 'nour@example.com', '2026-05-05'),
('Hana Mostafa', 'hana@example.com', '2026-06-12');


-- =================================
-- 6. Insert Loans
-- =================================

INSERT INTO LOAN
(book_id, member_id, loan_date, return_date)
VALUES
(1, 1, '2026-09-01', '2026-09-10'),
(1, 2, '2026-09-15', '2026-09-22'),
(2, 1, '2026-09-03', NULL),
(3, 2, '2026-09-05', '2026-09-18'),
(3, 3, '2026-10-01', NULL),
(4, 4, '2026-09-07', '2026-09-14'),
(5, 1, '2026-10-02', '2026-10-11'),
(5, 2, '2026-10-12', NULL),
(6, 3, '2026-10-03', '2026-10-09'),
(7, 4, '2026-10-04', '2026-10-13'),
(8, 1, '2026-10-05', '2026-10-15'),
(1, 3, '2026-10-20', NULL);