const express = require('express');
const app = express();
const port = 8080;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

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

  // always return as base64 — clean garbage on wrong password, valid text needs re-decoding
  return decrypted.toString('base64');
}

// ^^^ ty claude ;-; ^^^

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// app.listen(port, () => {
//     console.log(`anyChat listening at http://localhost:${port}`);
// });

io.on('connection', (socket) => {
    console.log('a user connected');

	socket.on("write", (data) => {
		// data structure = {username, text, chid, pw}
	})

	socket.on("read", (data) => {
		// data structure = {chid, pw} son that's the same
		

	})
});

server.listen(port, () => {
    console.log(`listening on port ${port}`);
});