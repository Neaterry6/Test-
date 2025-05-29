const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { get } = require("https");

module.exports = {
  config: {
    name: "autodl",
    version: "1.4.1",
    author: "AYANFE",
    description: "Auto-download and send Facebook video links.",
    category: "utility",
    usePrefix: false,
  },

  onStart: async function () {},

  onChat: async function ({ message, event, api }) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = event.body?.match(urlRegex);
    if (!urls) return;

    for (const link of urls) {
      if (!link.includes("facebook.com")) continue; // Skip non-Facebook links

      const apiUrl = `https://bk9.fun/download/fb?url=${encodeURIComponent(link)}`;
      const fileName = path.join(__dirname, "temp_video.mp4");

      try {
        message.reaction("⏳", event.messageID); // Loading indicator
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status) {
          message.reaction("❌", event.messageID);
          return message.reply("❌ Failed to fetch Facebook video details.");
        }

        const videoUrl = data.BK9.hd || data.BK9.sd;
        if (!videoUrl) {
          message.reaction("❌", event.messageID);
          return message.reply("❌ No video found to download.");
        }

        // Download video file
        const writer = fs.createWriteStream(fileName);

        get(videoUrl, (res) => {
          res.pipe(writer);

          writer.on("finish", async () => {
            try {
              await api.sendMessage(
                {
                  body: "📥 Video download complete! Here's your video.",
                  attachment: fs.createReadStream(fileName),
                },
                event.threadID
              );
              console.log("Video sent successfully!");
              message.reaction("✅", event.messageID); // Success indicator
            } catch (error) {
              console.error("Error sending video:", error);
              message.reply("❌ Error occurred while sending the video.");
            } finally {
              fs.unlinkSync(fileName); // Clean up
            }
          });

          writer.on("error", (err) => {
            console.error("File write error:", err.message);
            message.reply("❌ Failed to save the video.");
          });
        }).on("error", (err) => {
          console.error("Download error:", err.message);
          message.reply("❌ Error occurred while downloading the video.");
        });
      } catch (err) {
        console.error("API Error:", err.message);
        message.reply("❌ Error fetching Facebook video details.");
      }
    }
  },
};
