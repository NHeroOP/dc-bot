import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export default {
  name: "ban",
  description: "Bans a memeber from the server",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "target-user",
      description: "The user to ban",
      required: true,
      type: ApplicationCommandOptionType.Mentionable
    },
    {
      name: "reason",
      description: "The reason for the ban",
      type: ApplicationCommandOptionType.String
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.Administrator
  ],
  botPermissions: [PermissionFlagsBits.BanMembers],

  callback: (client, interaction) => {
    interaction.reply(`Ban ...!!!`);
  }
}