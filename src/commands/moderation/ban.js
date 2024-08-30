import pkg, { EmbedBuilder } from "discord.js";
const { ApplicationCommandOptionType, Client, Interaction,  PermissionFlagsBits } = pkg;


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

    let unableMsg = ""
    const unableEmbed = new EmbedBuilder()
      .addFields({ value: `\`\`\`${unableMsg}\`\`\`` })
      .setColor("RED")

    if (!targetUser) {
      unableMsg = "User not found"
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      unableMsg = "You cannot ban the owner of the server";
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;

    const requestedUserRolePosition = interaction.member.roles.highest.position;

    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestedUserRolePosition) {
      unableMsg = "You cannot ban a user with equal or higher role than you"
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      unableMsg = "I cannot ban a user with equal or higher role than me";
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    try {
      await targetUser.ban({ reason });

      const embed = new EmbedBuilder()
        .addFields({ value: `\`\`\`${targetUser.user.tag} has been banned\`\`\`` })
        .addFields({ name: "Reason", value: `\`\`\`${reason}\`\`\`` })
        .setColor("GREEN")
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