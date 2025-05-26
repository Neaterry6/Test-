const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = {}; 
// Structure: { username: { password: '...', profile: { createdAt: Date, otherDetails... }, chatHistory: [{from: 'user'|'bot', text: '...'}] } }

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send('Missing credentials.');
  if (users[username]) return res.send('Username already taken.');

  users[username] = {
    password,
    profile: { createdAt: new Date().toISOString() },
    chatHistory: []
  };
  res.redirect('/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    // redirect with username as URL param to chat page
    return res.redirect(`/chat.html?username=${encodeURIComponent(username)}`);
  }
  res.send('Invalid username or password.');
});

// Endpoint for AI chat messages
app.post('/ai-response', async (req, res) => {
  const { username, message } = req.body;
  if (!message) return res.status(400).send("No message.");
  if (!username || !users[username]) return res.status(400).send("Invalid user.");

  try {
    const msgLower = message.toLowerCase();

    // Save user message in chat history
    users[username].chatHistory.push({ from: 'user', text: message });

    let botResponse;

    if (msgLower.startsWith("play me")) {
      const song = message.replace(/play me/i, "").trim();
      botResponse = `Here’s your song baby: https://spotify-api-t6b7.onrender.com/play?song=${encodeURIComponent(song)}`;
    } else if (msgLower.startsWith("send me video")) {
      const query = message.replace(/send me video/i, "").trim() || "Rick Astley Never Gonna Give You Up";
      botResponse = `Here’s your video darling: https://spotify-api-t6b7.onrender.com/video?search=${encodeURIComponent(query)}`;
    } else if (msgLower.startsWith("generate image")) {
      const prompt = message.replace(/generate image/i, "").trim() || "goku";
      botResponse = `Here’s your image honey: https://smfahim.xyz/creartai?prompt=${encodeURIComponent(prompt)}`;
    } else {
      const { data } = await axios.get(`https://new-gf-ai.onrender.com/babe?query=${encodeURIComponent(message)}`);
      botResponse = data;
    }

    // Save bot response in chat history
    users[username].chatHistory.push({ from: 'bot', text: botResponse });

    res.send(botResponse);
  } catch (err) {
    console.error(err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Get chat history for user
app.get('/history/:username', (req, res) => {
  const username = req.params.username;
  if (!username || !users[username]) return res.status(404).json([]);
  res.json(users[username].chatHistory || []);
});

// Get profile data for user
app.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  if (!username || !users[username]) return res.status(404).json({ error: 'User not found' });

  const { profile } = users[username];
  res.json({
    username,
    createdAt: profile.createdAt,
  });
});

app.listen(port, () => console.log(`Toxic Baby AI running on http://localhost:${port}`))
