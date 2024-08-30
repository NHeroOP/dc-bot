import pkg from "discord.js";
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

    if (!targetUser) {
      await interaction.editReply("User not found");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("You cannot ban the owner of the server");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;

    const requestedUserRolePosition = interaction.member.roles.highest.position;

    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestedUserRolePosition) {
      await interaction.editReply("You cannot ban a user with equal or higher role than you");
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply("I cannot ban a user with equal or higher role than me");
      return;
    }

    try {
      await targetUser.ban({ reason });
      await interaction.editReply(`${targetUser.user.tag} has been banned from the server with reason: ${reason}`);
    }
    catch (error) {
      console.log("An error occured when banning", error);
      
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