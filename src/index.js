import { Client, IntentsBitField, EmbedBuilder, ActivityType } from "discord.js";
import "dotenv/config"
import eventHandler from "./handlers/eventHandler.js";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
})

// let status = [
//   {
//     name: "Not NHero 1",
//   },
//   {
//     name: "Not NHero 2",
//     type: ActivityType.Watching,
//   },
//   {
//     name: "Not NHero 3",
//     type: ActivityType.Listening,
//   },
// ]

// client.on("ready", (c) => {
//   console.log(`Logged in as ${c.user.tag}`);

//   setInterval(() => {
//     let random = Math.floor(Math.random() * status.length)
//     client.user.setActivity(status[random])
//   }, 10000);
// })

// client.on("messageCreate", (msg) => {
//   if (msg.author.bot) return;
  
//   if (msg.content.toLowerCase() == "hello") {
//     msg.reply("Hello")
//   }
// })

// client.on("interactionCreate", (interaction) => {
//   if (!interaction.isChatInputCommand()) return;

//   if (interaction.commandName === "add") {
//     const n1 = interaction.options.get("first_number")?.value;
//     const n2 = interaction.options.get("second_number")?.value;

//     interaction.reply(`The sum is ${n1 + n2}`);
    
//   }

//   if (interaction.commandName === "embed") {
//     const embed = new EmbedBuilder()
//       .setTitle("Embed Title")
//       .setDescription("Embed Description")
//       .setColor("Random")
//       .addFields({ name:"Field Title", value: "```Some Random Val```" })
    
//     interaction.reply({ embeds: [embed] })
//   }

  
// })

// client.on("interactionCreate", async (interaction) => {
//   try {
//     if (!interaction.isButton()) return;

//     await interaction.deferReply({ephemeral: true})

//     // const role = interaction.guild.role.cache.get(interaction.customId);
//     const role = interaction.guild.roles.cache.get(interaction.customId)


//     if (!role) {
//       interaction.editReply({
//         content: "Role not found",
//       });
//       return;
//     }

//     const hasRole = interaction.member.roles.cache.has(role.id);

//     if (hasRole) {
//       await interaction.member.roles.remove(role);
//       await interaction.editReply("Role removed");
//       return;
//     }

//     await interaction.member.roles.add(role)
//     await interaction.editReply("Role added");
//   } catch (error) {
//     console.log(error);
    
//   }
// })

// client.on("messageCreate", (msg) => {
//   if (msg.content === "embed") {
//     const embed = new EmbedBuilder()
//       .setTitle("Embed Title")
//       .setDescription("Embed Description")
//       .setColor("Random")
//       .addFields({ name: "Field Title", value: "```Some Random Val```" })
    
//     msg.channel.send({ embeds: [embed] })
//   }
// })


eventHandler(client);

client.login(process.env.TOKEN);