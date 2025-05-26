const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

let users = {}; // { username: password }
let chatHistory = {}; // { username: [messages] }

// Signup route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send('Missing credentials.');
  if (users[username]) return res.send('Username already taken.');

  users[username] = password;
  chatHistory[username] = [];
  res.redirect('/login.html');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] === password) {
    return res.redirect(`/chat.html?username=${encodeURIComponent(username)}`);
  }
  res.send('Invalid username or password.');
});

// AI response route
app.post('/ai-response', async (req, res) => {
  const { message, username } = req.body;
  if (!message) return res.status(400).send("No message.");

  try {
    const msgLower = message.toLowerCase();

    if (msgLower.startsWith("play me")) {
      const song = message.replace(/play me/i, "").trim();
      chatHistory[username].push({ from: 'user', message });
      chatHistory[username].push({ from: 'ai', message: `Here’s your song baby: https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}` });
      return res.send(`Here’s your song baby: https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}`);
    }

    if (msgLower.startsWith("send me video")) {
      const query = message.replace(/send me video/i, "").trim() || "Rick Astley Never Gonna Give You Up";
      chatHistory[username].push({ from: 'user', message });
      chatHistory[username].push({ from: 'ai', message: `Here’s your video darling: https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}` });
      return res.send(`Here’s your video darling: https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}`);
    }

    if (msgLower.startsWith("generate image")) {
      const prompt = message.replace(/generate image/i, "").trim() || "goku";
      chatHistory[username].push({ from: 'user', message });
      chatHistory[username].push({ from: 'ai', message: `Here’s your image honey: https://smfahim.xyz/creartai?prompt=${encodeURIComponent(prompt)}` });
      return res.send(`Here’s your image honey: https://smfahim.xyz/creartai?prompt=${encodeURIComponent(prompt)}`);
    }

    const { data } = await axios.get(`https://new-gf-ai.onrender.com/babe?query=${encodeURIComponent(message)}`);
    chatHistory[username].push({ from: 'user', message });
    chatHistory[username].push({ from: 'ai', message: data });
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Get chat history route
app.get('/history', (req, res) => {
  const username = req.query.username;
  res.json(chatHistory[username] || []);
});

app.listen(port, () => console.log(`Toxic Baby AI running on http://localhost:${port}`));