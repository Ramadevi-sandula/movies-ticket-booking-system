CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(50),
    language VARCHAR(30),
    duration INT,
    release_date DATE
);

CREATE TABLE IF NOT EXISTS shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    theatre_name VARCHAR(100) NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    show_id INT NOT NULL,
    seats INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'Confirmed',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (show_id) REFERENCES shows(show_id)
);

INSERT INTO movies (title, genre, language, duration, release_date)
SELECT * FROM (
    SELECT 'The Last Galaxy', 'Sci-Fi', 'English', 142, '2026-10-10'
    UNION ALL SELECT 'Midnight Mission', 'Action', 'Telugu',  124, '2026-09-18'
    UNION ALL SELECT 'Love in Bloom', 'Romance', 'Hindi', 128, '2026-08-22'
    UNION ALL SELECT 'The Hidden Truth', 'Thriller', 'English', 136, '2026-10-02'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM movies);

INSERT INTO shows (movie_id, theatre_name, show_date, show_time, ticket_price)
SELECT m.movie_id, 'PVR Cinemas', CURDATE(), '10:30:00', 180.00
FROM movies m
WHERE NOT EXISTS (SELECT 1 FROM shows WHERE shows.movie_id = m.movie_id);

INSERT INTO shows (movie_id, theatre_name, show_date, show_time, ticket_price)
SELECT m.movie_id, 'INOX Multiplex', CURDATE(), '18:30:00', 220.00
FROM movies m
WHERE NOT EXISTS (
    SELECT 1 FROM shows s WHERE s.movie_id = m.movie_id AND s.theatre_name = 'INOX Multiplex'
);
