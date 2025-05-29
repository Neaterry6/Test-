
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// File Paths
const usersFile = path.join(__dirname, "db", "user.json");
const historyFile = path.join(__dirname, "chat-history.json");
const commandsDir = path.join(__dirname, "commands");

// Load Users and Chat History
let users = {};
let chatHistory = {};

const loadFile = (filePath, defaultValue) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return data ? JSON.parse(data) : defaultValue;
    }
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
  }
  return defaultValue;
};

users = loadFile(usersFile, {});
chatHistory = loadFile(historyFile, {});

// Save Data to File
const saveFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving to ${filePath}:`, err.message);
  }
};

// Load Commands
const commands = {};
try {
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(commandsDir, file));
    if (command.config && command.onStart) {
      commands[command.config.name] = command;
      if (command.config.aliases) {
        for (const alias of command.config.aliases) {
          commands[alias] = command;
        }
      }
    }
  }
  console.log("Commands loaded:", Object.keys(commands));
} catch (err) {
  console.error("Error loading commands:", err.message);
}

// Routes

// Redirect Root to Login Page
app.get("/", (req, res) => res.redirect("/login.html"));

// Serve Static HTML Files
const staticFiles = ["chat.html", "profile.html", "chat-history.html"];
staticFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  });
});

// Signup Route
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing credentials.");
  if (users[username]) return res.status(409).send("Username already taken.");

  users[username] = password;
  chatHistory[username] = [];
  saveFile(usersFile, users);
  saveFile(historyFile, chatHistory);

  res.redirect("/login.html");
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing credentials.");
  if (users[username] === password) {
    return res.redirect(`/chat.html?username=${encodeURIComponent(username)}`);
  }
  res.status(401).send("Invalid username or password.");
});

// AI Response Route
app.post("/ai-response", async (req, res) => {
  try {
    const { message, username } = req.body;
    if (!chatHistory[username]) chatHistory[username] = [];

    chatHistory[username].push({ from: "user", message });
    saveFile(historyFile, chatHistory);

    const msgLower = message.toLowerCase();

    // Handle Commands
    if (msgLower.startsWith(".")) {
      const commandName = msgLower.slice(1).split(" ")[0]; // Extract command name
      const args = msgLower.slice(commandName.length + 2).split(" "); // Extract arguments

      const command = commands[commandName];
      if (command) {
        return command.onStart({
          api: { sendMessage: res.send },
          args,
          message: {
            reply: text => res.send(text),
            reaction: reaction => console.log(`Reaction: ${reaction}`),
          },
          event: { isGroup: true, messageID: "12345" },
        });
      } else {
        return res.send(`❌ Command '${commandName}' not found.`);
      }
    }

    // Default AI Chat
    const { data } = await axios.get(
      `https://new-gf-ai.onrender.com/babe?query=${encodeURIComponent(message)}`
    );
    chatHistory[username].push({ from: "bot", message: data });
    saveFile(historyFile, chatHistory);

    res.send(data);
  } catch (err) {
    console.error("Error in /ai-response:", err.message || err);
    res.status(500).send("AI offline baby, try later.");
  }
});

// Get Chat History
app.get("/history", (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "No username provided." });

  res.json(chatHistory[username] || []);
});

// Clear Chat History
app.get("/clear-history", (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "No username provided." });

  chatHistory[username] = [];
  saveFile(historyFile, chatHistory);

  res.json({ success: true, message: `History cleared for ${username}` });
});

// Start Server
app.listen(port, () => console.log(`Toxic Baby AI running at http://localhost:${port}`));
