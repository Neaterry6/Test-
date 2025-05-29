const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    aliases: ["commands", "usage"],
    description: "Displays a list of all available commands and their usage in a beautifully formatted way."
  },
  onStart({ message }) {
    const commandsDir = path.join(__dirname); // Path to the current commands directory

    // Read all files in the commands directory
    fs.readdir(commandsDir, (err, files) => {
      if (err) {
        console.error("Error reading commands directory:", err);
        return message.reply("❌ **Oops!** An error occurred while fetching the commands.");
      }

      // Filter JavaScript files (commands)
      const commandFiles = files.filter(file => file.endsWith(".js"));

      if (commandFiles.length === 0) {
        return message.reply("⚠️ **No commands found!** The `commands` directory seems to be empty.");
      }

      // Build the help message with beautiful formatting
      let helpMessage = `🌟 **Welcome to the Help Center!** 🌟\n\n`;
      helpMessage += `Here is a list of all available commands:\n\n`;

      commandFiles.forEach(file => {
        const command = require(path.join(commandsDir, file));

        // Append each command's details
        helpMessage += `🔹 **${command.config.name.toUpperCase()}**\n`;
        if (command.config.aliases && command.config.aliases.length > 0) {
          helpMessage += `   **Aliases**: ${command.config.aliases.join(", ")}\n`;
        }
        helpMessage += `   **Description**: ${command.config.description || "No description provided."}\n\n`;
      });

      helpMessage += `✨ **How to Use**:\n`;
      helpMessage += `   Type \`.command-name\` to execute a command.\n`;
      helpMessage += `   For example: \`.help\` to see this list again.\n\n`;
      helpMessage += `💡 **Tip**: Add new commands in the \`commands\` directory, and they will automatically appear here!`;

      // Send the help message
      message.reply(helpMessage);
    });
  }
};
