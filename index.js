const { Client, GatewayIntentBits, REST, Routes, InteractionType, VoiceChannel } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection  } = require('@discordjs/voice');
const { Player } = require("discord-player");
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

const player = new Player(client);
client.player = player;
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
    name: 'muteall',
    description: 'Mute all members in the voice channel',
  },
  {
    name: 'unmuteall',
    description: 'Unmute all members in the voice channel',
  },
  {
    name: 'help',
    description: 'Help command to display available commands',
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



// Mute all members in the voice channel //

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



// Unmute all members in the voice channel //

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

  await interaction.reply('Processing...');

  try {
    switch (interaction.commandName) {
      case 'muteall':
        await muteAll(interaction);
        break;
      case 'unmuteall':
        await unmuteAll(interaction);
        break;
      case 'join':
        await joinVC(interaction);
        break;
      case 'leave':
        await leaveVC(interaction);
        break;
      case 'help':
        const helpMessage = `**Available commands:**
        - /mute [user]: Mute a specific member in the voice channel.
        - /muteall: Mute all members in the voice channel.
        - /unmuteall: Unmute all members in the voice channel.
        - /help: Display this help message.
        - /join: Join the voice channel.
        - /leave: Leave the voice channel.
        - /play [song]: Play a song.
        - /skip: Skip the current song.
        - /stop: Stop the music.
        - /pause: Pause the current song.
        - /resume: Resume the paused song.`;
  
        await interaction.reply({ content: helpMessage, ephemeral: true }); // Ephemeral message
        break;
      default:
        await interaction.followUp('Invalid command.');
    }
    await interaction.editReply({ content: "Done!" }); 
  } catch (error) {
    console.error('Error handling interaction:', error);
    await interaction.followUp('An error occurred while processing your command.');
  }
});

client.login(token);
