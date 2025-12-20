export default {
  name: "chatgpt-discord-bot",
  version: "1.0.0",
  description: "一個能用 !gpt 對話與 /server 查資訊的 Discord Bot",
  main: "index.js",
  type: "module",
  scripts: {
    start: "node index.js"
  },
  dependencies: {
    "discord.js": "^14.16.3",
    "dotenv": "^16.4.5",
    "openai": "^4.73.0"
  }
};