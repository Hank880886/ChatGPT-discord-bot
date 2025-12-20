// =============================
// 🤖 Discord ChatGPT Bot + /server
// 使用 OpenRouter API (GPT-4o-mini)
// =============================

import dotenv from "dotenv";
import fetch from "node-fetch";
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
} from "discord.js";

dotenv.config();

// ====== 初始化 Discord Client ======
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ====== 啟動時 ======
client.once("ready", async () => {
  console.log(`✅ 機器人已啟動：${client.user.tag}`);

  // 註冊指令
  const commands = [
    new SlashCommandBuilder()
      .setName("server")
      .setDescription("顯示伺服器資訊"),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Slash 指令已註冊！");
  } catch (error) {
    console.error("❌ 指令註冊失敗：", error);
  }
});

// ====== /server 指令回覆 ======
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "server") {
    await interaction.reply({
      embeds: [
        {
          title: "🌐 伺服器資訊",
          fields: [
            { name: "名稱", value: interaction.guild.name, inline: true },
            { name: "人數", value: `${interaction.guild.memberCount}`, inline: true },
            { name: "ID", value: interaction.guild.id, inline: false },
          ],
          color: 0x00ffcc,
          footer: { text: `由 ${client.user.username} 提供` },
        },
      ],
    });
  }
});

// ====== ChatGPT 功能（!gpt 開頭） ======
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!gpt")) return;

  const userMessage = message.content.slice(4).trim();
  if (!userMessage) {
    await message.reply("請在 `!gpt` 後輸入想問的問題～");
    return;
  }

  await message.channel.sendTyping();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      console.error("❌ API 回應錯誤：", response.status, await response.text());
      await message.reply(`⚠️ API 出錯了 (${response.status})，請稍後再試！`);
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ 沒有收到回覆。";
    await message.reply(reply);
  } catch (error) {
    console.error("❌ API 請求發生錯誤：", error);
    await message.reply("⚠️ 出現錯誤，請稍後再試！");
  }
});

// ====== 啟動機器人 ======
client.login(process.env.DISCORD_TOKEN);