const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const config = {
  name: "pinterest",
  aliases: ["pin"],
  version: "1.1",
  author: "Ayanfe",
  role: 0,
  countDown: 10,
  category: "utility",
  shortDescription: { en: "Search for images using Unsplash API." },
  longDescription: { en: "Search for images on Unsplash and display them." },
  guide: { en: "{pn} [keyword] | [number of images]\n{pn} cats | 4" },
};

const onStart = async ({ api, args, message, event }) => {
  if (!event.isGroup) return;

  // Parse search query and number of images from input arguments
  const [searchQuery, numImages = 4] = args.join(" ").split("|").map(item => item.trim());

  if (!searchQuery) {
    return message.reply("❌ Please enter a keyword\nExample: ;pin funny cats | 4");
  }

  try {
    // Indicate processing
    message.reaction("⏳", event.messageID);

    const accessKey = "R6_-bAjOS06I89QrCoZ4zgVLEoLjjA3MdltvKuf2uD0"; // Unsplash API Access Key
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${Math.min(
      parseInt(numImages),
      15
    )}&client_id=${accessKey}`;

    const response = await axios.get(url);
    const results = response.data.results;

    if (results && results.length > 0) {
      const downloadFolder = path.join(__dirname, "tmp");
      const imagePaths = [];

      for (const [index, image] of results.slice(0, Math.min(results.length, 4)).entries()) {
        const imagePath = path.join(downloadFolder, `image_${index + 1}.jpg`);
        const imageResponse = await axios.get(image.urls.regular, { responseType: "arraybuffer" });
        await fs.writeFile(imagePath, imageResponse.data);
        imagePaths.push(imagePath);
      }

      // Send the images as a reply
      message.reply(
        {
          body: `Here are your images!`,
          attachment: imagePaths.map(imagePath => fs.createReadStream(imagePath)),
        },
        async () => {
          for (const imagePath of imagePaths) {
            await fs.unlink(imagePath);
          }
        }
      );
    } else {
      message.reply("❌ No images found 🗿");
    }
  } catch (error) {
    console.error("Error fetching images:", error.message || error);
    message.reply("❌ An error occurred while fetching the images. Please try again later.");
  } finally {
    message.reaction("✅", event.messageID);
  }
};

module.exports = { config, onStart };