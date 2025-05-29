const config = {
  name: "weather",
  aliases: ["w"],
  version: "1.0",
  author: "heisbroken",
  category: "utility",
  shortDescription: "Get the weather for a location.",
  longDescription: "Provides mock weather data for testing purposes.",
  guide: "{pn} [location]",
};

const onStart = async ({ args, message }) => {
  const location = args.join(" ").trim() || "your location";

  // Mock weather data
  const mockWeather = {
    "New York": {
      temperature: 25,
      description: "Sunny",
      humidity: 60,
      windSpeed: 5,
    },
    "London": {
      temperature: 15,
      description: "Cloudy",
      humidity: 80,
      windSpeed: 10,
    },
    default: {
      temperature: 20,
      description;
  const reply = `🌤 Weather in ${location}:\n- Temperature: ${weather.temperature}°C\n- Description: ${weather.description}\n- Humidity: ${weather.humidity}%\n- Wind Speed: ${weather.windSpeed} m/s`;

  message.reply(reply);
};

module.exports = { config, onStart };