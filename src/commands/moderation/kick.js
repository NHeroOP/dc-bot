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

    if (!targetUser) {
      unableMsg = "User not found"
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      unableMsg = "You cannot kick the owner of the server";
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;

    const requestedUserRolePosition = interaction.member.roles.highest.position;

    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestedUserRolePosition) {
      unableMsg = "You cannot kick a user with equal or higher role than you"
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      unableMsg = "I cannot kick a user with equal or higher role than me";
      await interaction.editReply({embeds: [unableEmbed]});
      return;
    }

    try {
      await targetUser.kick( reason );

      const embed = new EmbedBuilder()
        .addFields({ value: `\`\`\`${targetUser.user.tag} has been kicked\`\`\`` })
        .addFields({name: "Reason", value: `\`\`\`${reason}\`\`\``})
      await interaction.editReply({embeds: [embed]});
    }
    catch (error) {
      unableMsg = "An error occured when kicking"
      console.log(unableMsg, error);
      interaction.editReply({embeds: [unableEmbed]});
    }
    
  },


  name: "kick",
  description: "kicks a memeber from the server",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "target-user",
      description: "The user to kick",
      required: true,
      type: ApplicationCommandOptionType.Mentionable
    },
    {
      name: "reason",
      description: "The reason for the kick",
      type: ApplicationCommandOptionType.String
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.Administrator
  ],
  botPermissions: [PermissionFlagsBits.KickMembers],

  
}