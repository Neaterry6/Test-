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

let users = {};
let chatHistory = {};

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

    // PLAY ME command
    if (msgLower.startsWith("play me")) {
      const song = message.replace(/play me/i, "").trim();
      if (!song) return res.send("Please specify a song name.");

      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}`);
      const audioUrl = apiRes.data.audioUrl || apiRes.data.url || apiRes.data;

      const audioStream = await axios.get(audioUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'audio/mpeg');
      return audioStream.data.pipe(res);
    }

    // SEND ME VIDEO command
    if (msgLower.startsWith("send me video")) {
      const query = message.replace(/send me video/i, "").trim();
      if (!query) return res.send("Please specify a video search query.");

      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}`);
      const videoUrl = apiRes.data.videoUrl || apiRes.data.url || apiRes.data;

      const videoStream = await axios.get(videoUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'video/mp4');
      return videoStream.data.pipe(res);
    }

    // GENERATE IMAGE command
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
    res.send(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Chat history route
app.get('/history', (req, res) => {
  const username = req.query.username;
  res.json(chatHistory[username] || []);
});

// Server start
app.listen(port, () => console.log(`Toxic Baby AI running at http://localhost:${port}`));