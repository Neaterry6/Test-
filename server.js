const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// File paths
const usersFile = path.join(__dirname, 'data', 'users.json');
const historyFile = path.join(__dirname, 'data', 'history.json');

// Load users and chat history or initialize them
let users = {};
let chatHistory = {};

try {
  if (fs.existsSync(usersFile)) {
    const usersData = fs.readFileSync(usersFile, 'utf8');
    users = usersData ? JSON.parse(usersData) : {};
  }
} catch (err) {
  console.error("Error loading users.json:", err.message);
}

try {
  if (fs.existsSync(historyFile)) {
    const historyData = fs.readFileSync(historyFile, 'utf8');
    chatHistory = historyData ? JSON.parse(historyData) : {};
  }
} catch (err) {
  console.error("Error loading history.json:", err.message);
}

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Serve static HTML files explicitly
app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/chat-history.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat-history.html'));
});

// Signup route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing credentials.');
  if (users[username]) return res.status(409).send('Username already taken.');

  users[username] = password;
  chatHistory[username] = [];

  // Save to file
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  fs.writeFileSync(historyFile, JSON.stringify(chatHistory, null, 2));

  res.redirect('/login.html');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing credentials.');

  if (users[username] === password) {
    return res.redirect(`/chat.html?username=${encodeURIComponent(username)}`);
  }
  res.status(401).send('Invalid username or password.');
});

// AI response route
app.post('/ai-response', async (req, res) => {
  try {
    const { message, username } = req.body;
    if (!chatHistory[username]) chatHistory[username] = [];

    // Save user message
    chatHistory[username].push({ from: 'user', message });
    fs.writeFileSync(historyFile, JSON.stringify(chatHistory, null, 2));

    const msgLower = message.toLowerCase();

    // Play song
    if (msgLower.startsWith("play me")) {
      const song = message.replace(/play me/i, "").trim();
      if (!song) return res.send("Please specify a song name.");

      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}`);
      const audioUrl = apiRes.data.audioUrl || apiRes.data.url || apiRes.data;

      const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'audio/mpeg');
      return audioStream.data.pipe(res);
    }

    // Send video
    if (msgLower.startsWith("send me video")) {
      const query = message.replace(/send me video/i, "").trim();
      if (!query) return res.send("Please specify a video query.");

      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}`);
      const videoUrl = apiRes.data.videoUrl || apiRes.data.url || apiRes.data;

      const videoStream = await axios.get(videoUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'video/mp4');
      return videoStream.data.pipe(res);
    }

    // Generate image
    if (msgLower.startsWith("generate image")) {
      const prompt = message.replace(/generate image/i, "").trim();
      if (!prompt) return res.send("Please specify an image prompt.");

      const apiRes = await axios.get(`https://smfahim.xyz/creartai?prompt=${encodeURIComponent(prompt)}`);
      const imageUrl = apiRes.data.imageUrl || apiRes.data.url || apiRes.data;

      const imageStream = await axios.get(imageUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'image/jpeg');
      return imageStream.data.pipe(res);
    }

    // Default AI chat
    const { data } = await axios.get(`https://new-gf-ai.onrender.com/babe?query=${encodeURIComponent(message)}`);
    chatHistory[username].push({ from: 'bot', message: data });
    fs.writeFileSync(historyFile, JSON.stringify(chatHistory, null, 2));

    res.send(data);

  } catch (err) {
    console.error("Error in /ai-response:", err.message || err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Get chat history for a user
app.get('/history', (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "No username provided." });

  res.json(chatHistory[username] || []);
});

// Clear chat history for a user
app.get('/clear-history', (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "No username provided." });

  chatHistory[username] = [];
  fs.writeFileSync(historyFile, JSON.stringify(chatHistory, null, 2));

  res.json({ success: true, message: `History cleared for ${username}` });
});

// Start server
app.listen(port, () => console.log(`Toxic Baby AI running at http://localhost:${port}`));