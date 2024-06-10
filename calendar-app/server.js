const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('calendar.db'); // Use ':memory:' for an in-memory database or 'calendar.db' for a file-based database

// Drop the existing table (if any) and create a new table with UNIQUE constraint on the 'day' column
db.serialize(() => {
    db.run('DROP TABLE IF EXISTS events');
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day INTEGER UNIQUE,
        content TEXT
    )`);
});

// Get events
app.get('/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

// Add or update event
app.post('/events', (req, res) => {
    const { day, content } = req.body;
    db.run('INSERT INTO events (day, content) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET content=?', [day, content, content], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ id: this.lastID });
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
