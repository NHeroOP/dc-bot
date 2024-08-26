import { data } from '../../../config.js';
import getLocalCommands from "../../utils/getLocalCommands.js"

export default async function handleCommands(client, interaction) {
  
  
  if (!interaction.isChatInputCommand()) return;
  
  const localCommands = await getLocalCommands();
  
  
  try {
    const commandObj = localCommands.find((cmd) => cmd.name === interaction.commandName)

    if (!commandObj) return;
    
    if (commandObj.devsOnly) {
      if (!data.devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "Only developers can use this command",
          ephemeral: true
        })
        return;
      }
    }

    if (commandObj.testOnly) {
      if (!(interaction.guild.id === data.testServer)) {
        interaction.reply({
          content: "This command can only be used in the test server",
          ephemeral: true
        })
        return;
      }
    }

    if (commandObj.permissionsRequired?.length) {
      for (const permission of commandObj.permissionsRequired) {
        
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: "You do not have the required permissions to use this command",
            ephemeral: true
          })
          return;
        }
      }

    }

    if (commandObj.botPermissions?.length) {
      for (const permission of commandObj.botPermissions) {
        const bot = interaction.guild.members.me;
        
        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I do not have the required permissions to execute this command",
            ephemeral: true
          })
          return;
        }
      }
    }

    await commandObj.callback(client, interaction)
    

  } catch (error) {
    console.log(`Error: ${error}`);
  }
}