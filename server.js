
// ==========================================
// CINEBOOK - ONLINE MOVIE TICKET BOOKING
// SERVER.JS
// ==========================================

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 3000;

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MYSQL CONNECTION
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "movie_booking",
    waitForConnections: true,
    connectionLimit: 10
});

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

app.get("/api/test", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            message: "Database connected successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
});

// ==========================================
// GET MOVIES
// ==========================================

app.get("/api/movies", async (req, res) => {
    try {
        const [movies] = await db.query(`
            SELECT DISTINCT
                m.id,
                m.title,
                m.genre,
                m.language,
                m.duration,
                m.release_date
            FROM movies m
            INNER JOIN shows s ON s.movie_id = m.id
            ORDER BY m.id
        `);

        res.json(movies);

    } catch (error) {
        console.error("Movies Error:", error);

        res.status(500).json({
            message: "Unable to load movies"
        });
    }
});

// ==========================================
// GET SHOWS
// ==========================================

app.get("/api/shows", async (req, res) => {
    try {
        const [shows] = await db.query(`
            SELECT
                s.id,
                s.movie_id,
                DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
                TIME_FORMAT(s.show_time, '%H:%i:%s') AS show_time,
                s.price,
                s.theatre_name,
                m.title
            FROM shows s
            INNER JOIN movies m ON m.id = s.movie_id
            ORDER BY s.show_date, s.show_time
        `);

        res.json(shows);

    } catch (error) {
        console.error("Shows Error:", error);

        res.status(500).json({
            message: "Unable to load shows"
        });
    }
});

// ==========================================
// CREATE BOOKING
// PHONE FIELD REMOVED
// ==========================================

app.post("/api/bookings", async (req, res) => {

    const { name, email, show_id, tickets } = req.body;

    if (
        !name ||
        !email ||
        !show_id ||
        !tickets
    ) {
        return res.status(400).json({
            message: "Please enter all booking details"
        });
    }

    const ticketCount = Number(tickets);
    const showId = Number(show_id);

    if (
        !Number.isInteger(ticketCount) ||
        ticketCount < 1 ||
        ticketCount > 10
    ) {
        return res.status(400).json({
            message: "Tickets must be between 1 and 10"
        });
    }

    if (!Number.isInteger(showId) || showId <= 0) {
        return res.status(400).json({
            message: "Please select a valid show"
        });
    }

    let connection;

    try {

        connection = await db.getConnection();

        await connection.beginTransaction();

        // CHECK SELECTED SHOW
        const [showRows] = await connection.query(
            "SELECT id, price FROM shows WHERE id = ?",
            [showId]
        );

        if (showRows.length === 0) {
            throw new Error("Selected show is not available");
        }

        // CALCULATE TOTAL AMOUNT
        const totalAmount =
            Number(showRows[0].price) * ticketCount;

        // INSERT USER
        const [userResult] = await connection.query(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [
                name.trim(),
                email.trim()
            ]
        );

        // INSERT BOOKING
        const [bookingResult] = await connection.query(
            `INSERT INTO bookings
            (user_id, show_id, tickets, total_amount)
            VALUES (?, ?, ?, ?)`,
            [
                userResult.insertId,
                showId,
                ticketCount,
                totalAmount
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Booking successful",
            booking_id: bookingResult.insertId,
            total_amount: totalAmount
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Booking Error:", error);

        res.status(500).json({
            message: error.message || "Booking failed"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
});

// ==========================================
// GET ALL BOOKINGS
// ==========================================

app.get("/api/bookings", async (req, res) => {

    try {

        const [bookings] = await db.query(`
            SELECT
                b.id AS booking_id,
                u.name AS name,
                u.email AS email,
                m.title AS title,
                s.theatre_name AS theatre_name,
                DATE_FORMAT(s.show_date, '%Y-%m-%d') AS show_date,
                TIME_FORMAT(s.show_time, '%H:%i:%s') AS show_time,
                b.tickets,
                b.total_amount,
                b.booking_date
            FROM bookings b
            INNER JOIN users u ON u.id = b.user_id
            INNER JOIN shows s ON s.id = b.show_id
            INNER JOIN movies m ON m.id = s.movie_id
            ORDER BY b.id DESC
        `);

        res.json(bookings);

    } catch (error) {

        console.error("Bookings Error:", error);

        res.status(500).json({
            message: "Unable to load bookings"
        });
    }
});

// ==========================================
// DELETE BOOKING
// ==========================================

app.delete("/api/bookings/:id", async (req, res) => {

    try {

        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const [result] = await db.query(
            "DELETE FROM bookings WHERE id = ?",
            [bookingId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking deleted successfully"
        });

    } catch (error) {

        console.error("Delete Error:", error);

        res.status(500).json({
            message: "Unable to delete booking"
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {

    try {

        await db.query("SELECT 1");

        console.log("MySQL connected successfully!");

        app.listen(PORT, () => {
            console.log(
                `CineBook running at http://localhost:${PORT}`
            );
        });

    } catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );
    }
}

startServer();
