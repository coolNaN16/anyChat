const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS chats", (err) => {
        if (err) console.error("FAILED TO DELETE TABLE");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS chats (
            MsgId INTEGER PRIMARY KEY AUTOINCREMENT,
            ChannelId TEXT NOT NULL,
            Username TEXT NOT NULL,
            Text TEXT NOT NULL,
            Date TEXT DEFAULT CURRENT_TIMESTAMP
        )`, 
    (err) => {
        if (err) {
            console.error("ERROR MAKING TABLE");
        }
    });
    db.close();
});

