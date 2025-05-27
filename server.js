
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
  if (!username || !password) return res.status(400).send('Missing credentials.');
  if (users[username]) return res.status(409).send('Username already taken.');

  users[username] = password;
  chatHistory[username] = [];
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

// AI response route (text or media URLs)
app.post('/ai-response', async (req, res) => {
  const { message, username } = req.body;
  if (!message) return res.status(400).send("No message.");
  if (!username) return res.status(400).send("No username.");

  try {
    if (!chatHistory[username]) chatHistory[username] = [];
    
    // Save user message
    chatHistory[username].push({ from: 'user', message });

    const msgLower = message.toLowerCase();

    if (msgLower.startsWith("play me")) {
      const song = message.replace(/play me/i, "").trim();
      if (!song) {
        const reply = "Please specify a song name.";
        chatHistory[username].push({ from: 'bot', message: reply });
        return res.send(reply);
      }

      // Call your external API to get audio URL
      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}`);
      // Extract audio URL from response data safely
      const audioUrl = apiRes.data.audioUrl || apiRes.data.url || apiRes.data;

      const reply = `Here's your song: ${audioUrl}`;
      chatHistory[username].push({ from: 'bot', message: reply });
      return res.send(reply);
    }

    if (msgLower.startsWith("send me video")) {
      const query = message.replace(/send me video/i, "").trim();
      if (!query) {
        const reply = "Please specify a video search query.";
        chatHistory[username].push({ from: 'bot', message: reply });
        return res.send(reply);
      }

      const apiRes = await axios.get(`https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}`);
      const videoUrl = apiRes.data.videoUrl || apiRes.data.url || apiRes.data;

      const reply = `Here's your video: ${videoUrl}`;
      chatHistory[username].push({ from: 'bot', message: reply });
      return res.send(reply);
    }

    if (msgLower.startsWith("generate image")) {
      const prompt = message.replace(/generate image/i, "").trim();
      if (!prompt) {
        const reply = "Please specify an image prompt.";
        chatHistory[username].push({ from: 'bot', message: reply });
        return res.send(reply);
      }

      const apiRes = await axios.get(`https://smfahim.xyz/creartai?prompt=${encodeURIComponent(prompt)}`);
      const imageUrl = apiRes.data.imageUrl || apiRes.data.url || apiRes.data;

      const reply = `Here's your image: ${imageUrl}`;
      chatHistory[username].push({ from: 'bot', message: reply });
      return res.send(reply);
    }

    // Default AI chat
    const { data } = await axios.get(`https://new-gf-ai.onrender.com/babe?query=${encodeURIComponent(message)}`);

    // Save AI reply
    chatHistory[username].push({ from: 'bot', message: data });

    res.send(data);

  } catch (err) {
    console.error("Error in /ai-response:", err.message || err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Chat history route
app.get('/history', (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "No username provided." });
  res.json(chatHistory[username] || []);
});

// Server start
app.listen(port, () => console.log(`Toxic Baby AI running at http://localhost:${port}`));