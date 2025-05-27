// Get username from URL
function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('username') || '';
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  // Save preference
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
function loadDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }
}

// Utility: check if string is a URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Utility: Detect media URL type
function detectMediaType(url) {
  if (!isValidUrl(url)) return null;
  const ext = url.split('.').pop().toLowerCase();
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
  return null;
}

// Create message element based on content
function createMessageElement(msg, from) {
  const div = document.createElement('div');
  div.classList.add('message', from);

  // If message starts with "Here's your ..." try to extract URL and media type
  const mediaUrlMatch = msg.match(/(https?:\/\/[^\s]+)/);
  if (mediaUrlMatch) {
    const url = mediaUrlMatch[0];
    const mediaType = detectMediaType(url);

    if (mediaType === 'audio') {
      div.textContent = msg.replace(url, '').trim(); // text part before URL
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      audio.style.display = 'block';
      div.appendChild(audio);
      return div;
    }

    if (mediaType === 'video') {
      div.textContent = msg.replace(url, '').trim(); // text part before URL
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.style.maxWidth = '100%';
      video.style.display = 'block';
      div.appendChild(video);
      return div;
    }

    if (mediaType === 'image') {
      div.textContent = msg.replace(url, '').trim(); // text part before URL
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Generated Image';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      div.appendChild(img);
      return div;
    }
  }

  // Default: just text
  div.textContent = msg;
  return div;
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
    if (history.length === 0) {
      container.innerHTML = '<p>No chat history yet. Say hi!</p>';
      return;
    }
    history.forEach(msgObj => {
      const msgEl = createMessageElement(msgObj.message, msgObj.from);
      container.appendChild(msgEl);
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
  const userDiv = createMessageElement(msg, 'user');
  container.appendChild(userDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/ai-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message: msg })
    });

    const botMsg = await res.text();

    const botDiv = createMessageElement(botMsg, 'bot');
    container.appendChild(botDiv);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    console.error(err);
    const botDiv = createMessageElement('Oops, something went wrong.', 'bot');
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