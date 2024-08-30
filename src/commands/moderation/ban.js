import pkg, { EmbedBuilder } from "discord.js";
const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = pkg;

const embeder = (msg) => {
  return new EmbedBuilder().setColor("#ED4245").addFields({name: " ", value: `❌ ***${msg}***` })
}


export default {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
  */
  

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("target-user").value;
    const reason = interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply()
    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply({embeds: [embeder("User not found")]});
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply({embeds: [embeder("You cannot ban the owner of the server")]});
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;

    const requestedUserRolePosition = interaction.member.roles.highest.position;

    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestedUserRolePosition) {
      await interaction.editReply({embeds: [embeder("You cannot ban a user with equal or higher role than you")]});
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({embeds: [embeder("I cannot ban a user with equal or higher role than me")]});
      return;
    }

    try {
      await targetUser.ban({ reason });

      const embed = new EmbedBuilder()
        .addFields({ name: " ", value: `✅ ***${targetUser.user.tag} has been banned***` })
        .addFields({ name: "Reason", value: `***${reason}***` })
        .setColor("#57F287")
      await interaction.editReply({embeds: [embed]});
    }
    catch (error) {
      unableMsg = "An error occured when banning"
      console.log(unableMsg, error);
      interaction.editReply({embeds: [unableEmbed]});
    }
    
  },


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

  
}