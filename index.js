const express = require('express');
const app = express();
const port = 8080;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS chats (
            MsgId INTEGER PRIMARY KEY AUTOINCREMENT,
            ChannelId TEXT,
            Username TEXT,
            Text TEXT,
            Date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `, (err) => {
        if (err) {
			console.log("ERROR MAKING TABLE")
        }
    });
});

const crypto = require('crypto');

//  vvv ty claude ;-; vvv

function encryptMessage(text, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted.toString('base64')}`;
}

function decryptMessage(payload, password) {
  const [saltHex, ivHex, encryptedB64] = payload.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(password, salt, 32);
  const encrypted = Buffer.from(encryptedB64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  // always return as utf8 — clean garbage on wrong password, valid text needs re-decoding
  return decrypted.toString('utf8');
}

// ^^^ ty claude ;-; ^^^

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// app.listen(port, () => {
//     console.log(`anyChat listening at http://localhost:${port}`);
// });

function send_msg(user, msg, chid) {
    db.run(
        `INSERT INTO chats (ChannelId, Username, Text) VALUES (?, ?, ?);`, 
        [chid, user, msg], 
        function(err) {
            if (err) {
                return console.error("Failed send_msg", err.message);
            }
        }
    );
}

function read_msg(chid, callback) {
    db.all(`SELECT * FROM chats WHERE ChannelId = ? ORDER BY Date DESC;`, [chid], (err, rows) => {
        if (err) {
            console.error("Failed read_msg: ", err.message);
            return callback(err, null);
        }
        callback(null, rows);
    });
}

let global_data = {}

io.on('connection', (socket) => {
    console.log('a user connected');

	global_data[socket.id] = {
		"ChannelId" : 0
	}

	socket.on("write", (data) => {
		// data structure = {username, text, chid, pw}
		const enc_text = encryptMessage(data.text, data.pw)
		const enc_user = encryptMessage(data.username, data.pw)
		
		global_data[socket.id].ChannelId = data.chid
		send_msg(enc_user, enc_text, global_data[socket.id].ChannelId)
		
		let payload = []
		read_msg(global_data[socket.id].ChannelId, (err, messages) => {
			if (err) {
				return
			}
			
			let payload = []
			for (const msg of messages) {
				payload.push({
					"Message" : decryptMessage(msg.Text, data.pw),
					"Username" : decryptMessage(msg.Username, data.pw),
                    "Date" : msg.Date
				})
			}

			socket.emit("res_msg", {"Messages" : payload})
		});	
	})

	socket.on("read", (data) => {
		// data structure = {chid, pw}
		
		global_data[socket.id].ChannelId = data.chid

		read_msg(global_data[socket.id].ChannelId, (err, messages) => {
			if (err) {
				return
			}
			
			let payload = []
			for (const msg of messages) {
				payload.push({
					"Message" : decryptMessage(msg.Text, data.pw),
					"Username" : decryptMessage(msg.Username, data.pw),
                    "Date" : msg.Date
				})
			}

			socket.emit("res_msg", {"Messages" : payload})
		});	
	})
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});