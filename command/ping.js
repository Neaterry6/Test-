const config = {
  name: "ping",
  aliases: ["p"],
  version: "1.0",
  author: "heisbroken",
  shortDescription: { en: "Ping the server." },
};

const onStart = async ({ message }) => {
  message.reply("Pong! 🏓");
};

module.exports = { config, onStart };
