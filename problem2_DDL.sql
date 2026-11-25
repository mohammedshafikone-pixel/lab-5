-- Lab 5 - Part II (Problem 2) - Library database
-- Includes the Lab 4 six-table schema, the new REVIEW table,
-- and the BONUS view book_details.
-- Run this file first.

DROP DATABASE IF EXISTS library_lab4;
CREATE DATABASE library_lab4;
USE library_lab4;

CREATE TABLE AUTHOR (
    author_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(80) NOT NULL
);

CREATE TABLE PUBLISHER (
    publisher_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(80) NOT NULL
);

CREATE TABLE CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE BOOK (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    publish_year YEAR NOT NULL,
    author_id INT NOT NULL,
    publisher_id INT NOT NULL,
    category_id INT NOT NULL,
    CONSTRAINT fk_book_author
        FOREIGN KEY (author_id) REFERENCES AUTHOR(author_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_book_publisher
        FOREIGN KEY (publisher_id) REFERENCES PUBLISHER(publisher_id),
    CONSTRAINT fk_book_category
        FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
);

CREATE TABLE MEMBER (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    join_date DATE NOT NULL
);

CREATE TABLE LOAN (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    loan_date DATE NOT NULL,
    return_date DATE NULL,
    CONSTRAINT fk_loan_book
        FOREIGN KEY (book_id) REFERENCES BOOK(book_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_loan_member
        FOREIGN KEY (member_id) REFERENCES MEMBER(member_id)
);

-- New table for Lab 5
CREATE TABLE REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    rating INT NOT NULL,
    review_date DATE NOT NULL,
    CONSTRAINT fk_review_book
        FOREIGN KEY (book_id) REFERENCES BOOK(book_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_review_member
        FOREIGN KEY (member_id) REFERENCES MEMBER(member_id),
    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT uq_review_book_member UNIQUE (book_id, member_id)
);

-- BONUS: catalogue view joining BOOK, AUTHOR, PUBLISHER and CATEGORY
CREATE VIEW book_details AS
SELECT
    b.book_id,
    b.title,
    b.price,
    b.publish_year,
    b.author_id,
    a.name AS author_name,
    a.country AS author_country,
    b.publisher_id,
    p.name AS publisher_name,
    p.country AS publisher_country,
    b.category_id,
    c.name AS category_name
FROM BOOK b
JOIN AUTHOR a ON a.author_id = b.author_id
JOIN PUBLISHER p ON p.publisher_id = b.publisher_id
JOIN CATEGORY c ON c.category_id = b.category_id;
