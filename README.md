
# Toxic Baby AI

A fun AI chat web app with user signup/login, chat history, user profiles, and dark/light mode toggle.

---

## Features

- User registration and login
- Persistent chat history per user
- Profile page showing user details
- Chat interface with AI responses
- Dark mode and light mode toggle
- Special commands for playing songs, videos, and generating images

---

## Installation

1. Clone the repo:

   ```bash
   git clone https://your-repo-url.git
   cd toxic-baby-ai

2. Install dependencies:

npm install


3. Start the server:

npm start


4. Open your browser at http://localhost:8080




---

Usage

Signup a new user on /signup.html

Login on /login.html

Chat on /chat.html?username=yourusername

View your profile on /profile.html?username=yourusername

Use commands like:

play me <song name>

send me video <search term>

generate image <prompt>




---

Project Structure

toxic-baby-ai/
├── package.json
├── server.js
└── public/
    ├── chat.html
    ├── login.html
    ├── signup.html
    ├── profile.html
    ├── styles.css
    └── script.js


---

Notes

This app stores user data and chat history in memory; data will be lost on server restart.

For production, integrate a database like MongoDB or PostgreSQL.

The AI responses are fetched from external APIs and may occasionally be offline.



---

License

MIT © broken Titan


