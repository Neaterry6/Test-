const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "install-cmd",
    aliases: ["install", "add-command"],
    description: "Installs a new command from a given URL into the commands directory."
  },
  async onStart({ message, args }) {
    if (args.length === 0) {
      return message.reply("❌ **Error:** Please provide a URL to the command file you want to install.\nExample: `.install-cmd https://example.com/command.js`");
    }

    const commandUrl = args[0];
    const commandsDir = path.join(__dirname);

    try {
      // Fetch the command file from the provided URL
      const response = await axios.get(commandUrl);

      if (response.status !== 200 || !response.data) {
        return message.reply("❌ **Error:** Failed to download the command file. Please check the URL and try again.");
      }

      // Extract the filename from the URL
      const fileName = path.basename(commandUrl);
      if (!fileName.endsWith(".js")) {
        return message.reply("❌ **Error:** The file must be a JavaScript file (.js).");
      }

      // Save the file into the commands directory
      const filePath = path.join(commandsDir, fileName);
      fs.writeFileSync(filePath, response.data, "utf-8");

      message.reply(`✅ **Success:** The command \`${fileName}\` has been installed successfully!`);
    } catch (error) {
      console.error("Error installing command:", error);
      message.reply("❌ **Error:** An unexpected error occurred while installing the command. Please try again.");
    }
  }
};
