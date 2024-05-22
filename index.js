const { Client, GatewayIntentBits, REST, Routes, InteractionType } = require('discord.js');
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
  {
    name: "join",
    description: "Join the voice channel",
  },
  {
    name: 'play',
    description: 'Play a song',
    options: [
      {
        name: 'song',
        description: 'The song you want to play',
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: 'skip',
    description: 'Skip the current song',
  },
  {
    name: 'stop',
    description: 'Stop the music',
  },
  {
    name: 'pause',
    description: 'Pause the current song',
  },
  {
    name: 'resume',
    description: 'Resume the paused song',
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



// Join and leave voice channel //

const joinVC = async (interaction) => {
  if (!interaction.member.voice.channel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;

  try {
    voiceConnection = await voiceChannel.join();
    console.log('Successfully joined voice channel:', voiceChannel.name);
    await interaction.reply('Joined voice channel!');

    lastActivity = Date.now(); // Reset last activity on join

    // Handle disconnection (optional)
    voiceConnection.on('disconnect', (error) => {
      if (error && error.code !== VoiceConnectionStatus.DISCONNECTED) {
        console.error('Error disconnecting from voice channel:', error);
      }
    });
  } catch (error) {
    console.error('Error joining voice channel:', error);
    await interaction.reply('An error occurred while joining the voice channel.', { ephemeral: true });
  }
};

const leaveVC = async () => {
  if (voiceConnection && voiceConnection.status === VoiceConnectionStatus.Ready) {
    try {
      await voiceConnection.disconnect();
      console.log('Disconnected from voice channel.');
    } catch (error) {
      console.error('Error disconnecting from voice channel:', error);
    } finally {
      voiceConnection = null; // Clear connection reference
    }
  }
};



client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  await interaction.reply('Processing...');

  try {
    if (interaction.commandName === 'muteall') {
      await muteAll(interaction);
    }
    else if (interaction.commandName === 'unmuteall') {
      await unmuteAll(interaction);
    }
    else if (interaction.commandName === "join") {
      await joinVC(interaction);
    }
    else if (interaction.commandName === "leave") {
      await leaveVC(interaction);
    }
    else if (interaction.commandName === 'help') {
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
    }
    else if (interaction.commandName === 'play') {
      // Join the user's voice channel
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) return interaction.reply('You need to be in a voice channel to play music!');
      await player.join({
        guild: interaction.guildId,
        channel: voiceChannel.id,
        host: 'localhost', // You may need to change this to your bot's IP address or domain
      });
  
      // Play the requested song
      const track = await player.play(interaction, args.getString('song'), { firstResult: true });
      if (!track) return interaction.reply('No results found!');
      interaction.reply(`Now playing: ${track.title}`);
    } else if (interaction.commandName === 'skip') {
      player.skip(interaction);
      interaction.reply('Skipped!');
    } else if (interaction.commandName === 'stop') {
      player.stop(interaction);
      interaction.reply('Stopped playback!');
    } else if (interaction.commandName === 'pause') {
      player.pause(interaction);
      interaction.reply('Paused playback!');
    } else if (interaction.commandName === 'resume') {
      player.resume(interaction);
      interaction.reply('Resumed playback!');
    }

    // Remove the temporary message (optional)
    await interaction.editReply({ content: "Done!" }); 
  }
  catch (error) {
    console.error('Error handling interaction:', error);
    await interaction.editReply({ content: 'An error occurred while processing your command.', ephemeral: true });
  }
});


client.login(token);
