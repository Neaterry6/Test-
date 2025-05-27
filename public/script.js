// Get username from URL
function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('username') || '';
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  // Save preference
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode').toString());
}

// Load dark mode preference
function loadDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }
}

// Load chat history from server and display
async function loadChatHistory() {
  const username = getUsernameFromURL();
  if (!username) {
    alert('No username found.');
    return;
  }
  const container = document.getElementById('chat-container');
  container.innerHTML = 'Loading chat history...';

  try {
    const res = await fetch(`/history?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    const history = await res.json();
    container.innerHTML = '';
    if (!Array.isArray(history) || history.length === 0) {
      container.innerHTML = '<p>No chat history yet. Say hi!</p>';
      return;
    }
    history.forEach(msg => {
      const div = document.createElement('div');
      div.classList.add('message', msg.from); // shorthand for two class adds
      div.textContent = msg.message;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Failed to load chat history.</p>';
  }
}

// Send message to AI and update chat
async function sendMessage(event) {
  event.preventDefault();
  const username = getUsernameFromURL();
  if (!username) {
    alert('No username found.');
    return;
  }
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const container = document.getElementById('chat-container');

  // Append user message immediately
  const userDiv = document.createElement('div');
  userDiv.classList.add('message', 'user');
  userDiv.textContent = msg;
  container.appendChild(userDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message: msg }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const botMsg = await res.text();

    const botDiv = document.createElement('div');
    botDiv.classList.add('message', 'bot');
    botDiv.textContent = botMsg;
    container.appendChild(botDiv);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    console.error(err);
    const botDiv = document.createElement('div');
    botDiv.classList.add('message', 'bot');
    botDiv.textContent = 'Oops, something went wrong.';
    container.appendChild(botDiv);
    container.scrollTop = container.scrollHeight;
  }
}

// On DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadDarkMode();
  loadChatHistory();

  // Attach dark mode toggle button handler
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleDarkMode);
  }

  // Attach chat form submit handler
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', sendMessage);
  }
});