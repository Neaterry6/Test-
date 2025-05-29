// 🚀 Ping Command Configuration 🚀
const config = {
  name: "ping", // Command name
  aliases: ["p"], // Quick-access shortcuts
  version: "1.0", // Command version
  author: "heisbroken", // Creator of the command

  shortDescription: { 
    en: "Check if the server is alive and responsive." // Brief summary
  },

  longDescription: {
    en: `
    🏓 **Ping Command**
    
    The **Ping** command helps verify if the server is online.
    When triggered, it responds with a "Pong!" to confirm server status.
    
    Perfect for ensuring smooth connectivity! 🚀
    `
  },

  usage: ".ping", // How to trigger this command
  examples: [
    ".ping", // Standard usage
    ".p"     // Alternative shortcut
  ]
};

// 🌟 Command Execution Logic 🌟
const onStart = async ({ message }) => {
  // Dynamic, engaging response
  const response = `
  🎉 **PONG!** 🎉
  
  ✅ The server is alive and running smoothly!
  🔄 No delays, no hiccups—just seamless performance!
  
  🏓 Keep pinging, keep winning!
  `;

  message.reply(response.trim());
};

// 📦 Export the command module
module.exports = { config, onStart };
