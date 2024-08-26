import { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import "dotenv/config"

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
})

const roles = [
  {
    id: "1243150966413328464",
    label: "Red"
  },
  {
    id: "1243150974923571311",
    label: "Blue"
  },
  {
    id: "1243150976035065982",
    label: "Green"
  },
]

client.on("ready", async (c) => {
  try {
    const channel = client.channels.cache.get("1276987292149616641")

    if (!channel) return;

    const row = new ActionRowBuilder()
    roles.forEach(role => {
      row.components.push(
        new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
      )
    })

    await channel.send({
      content: "Pick a color",
      components: [row]
    })

    process.exit()

  } catch (error) {
    console.log(error);
    
  }
})


client.login(process.env.TOKEN);