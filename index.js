const { Client, GatewayIntentBits, REST, Routes, InteractionType } = require('discord.js');
require('dotenv').config()

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID
const commandPrefix = process.env.COMMAND_PREFIX

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const commands = [
  {
    name: 'mute',
    description: 'Mute a specific member in the voice channel',
    options: [
      {
        name: 'user',
        description: 'The member to mute',
        type: 6, // User
        required: true,
      },
    ],
  },
  {
    name: 'unmuteall',
    description: 'Unmute all members in the voice channel',
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands globally
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    // Register commands for a specific guild (for quicker testing)
    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const muteMember = async (interaction, member) => {
  if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
    return interaction.reply('You do not have permission to mute members.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  if (!member.voice.channel || member.voice.channel !== voiceChannel) {
    return interaction.reply('The user is not in the same voice channel as you.', { ephemeral: true });
  }

  try {
    await member.voice.setMute(true);
    console.log(`Muted ${member.user.id}`);
    await interaction.reply(`${member.user.username} has been muted.`);
  } catch (error) {
    console.error(`Error muting ${member.user.id}`, error);
    await interaction.reply('An error occurred while muting the member.', { ephemeral: true });
  }
};



const muteAll = async (interaction) => {
  if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
    return interaction.reply('You do not have permission to mute members.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  try {
    for (const [memberID, member] of voiceChannel.members) {
      try {
        await member.voice.setMute(true);
        console.log(`Muted ${member.user.id}`);
      } catch (error) {
        console.error(`Error muting ${member.user.id}`, error);
        // Handle individual unmute errors here (e.g. log and continue)
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    // Check if interaction has already been acknowledged
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply('All members in the voice channel have been muted.');
    }
  } catch (error) {
    console.error('Error occurred while muting members:', error);
    // Handle general error
    await interaction.reply({ content: 'An error occurred while muting members.', ephemeral: true });
  }
};




const unmuteAll = async (interaction) => {
  if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
    return interaction.reply('You do not have permission to unmute members.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  try {
    for (const [memberID, member] of voiceChannel.members) {
      try {
        await member.voice.setMute(false);
        console.log(`Unmuted ${member.user.id}`);
      } catch (error) {
        console.error(`Error unmuting ${member.user.id}`, error);
        // Handle individual unmute errors here (e.g. log and continue)
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    // Check if interaction has already been acknowledged
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply('All members in the voice channel have been unmuted.');
    }
  } catch (error) {
    console.error('Error occurred while unmuting members:', error);
    // Handle general error
    await interaction.reply({ content: 'An error occurred while unmuting members.', ephemeral: true });
  }
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // Send a temporary message while processing (optional)
  await interaction.reply('Processing...');

  try {
    if (interaction.commandName === 'mute') {
      const targetUser = interaction.options.getUser('user', true); // Get the target user
      await muteMember(interaction, targetUser);
    } else if (interaction.commandName === 'muteall') {
      await muteAll(interaction);
    } else if (interaction.commandName === 'unmuteall') {
      await unmuteAll(interaction);
    } else if (interaction.commandName === 'help') {
      const helpMessage = `**Available commands:**
      - /mute [user]: Mute a specific member in the voice channel.
      - /muteall: Mute all members in the voice channel.
      - /unmuteall: Unmute all members in the voice channel.`;
      await interaction.reply({ content: helpMessage, ephemeral: true }); // Ephemeral message
    }

    // Remove the temporary message (optional)
    await interaction.editReply({ content: 'Done!' }); // Replace with success message
  } catch (error) {
    console.error('Error handling interaction:', error);
    // Handle errors appropriately (e.g., log and send generic error message)
    await interaction.editReply({ content: 'An error occurred while processing your command.', ephemeral: true });
  }
});

client.login(token); // Login the bot

  
