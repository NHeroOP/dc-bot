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
    name: 'muteall',
    description: 'Mute all members in the voice channel',
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

const muteAll = async (interaction) => {
  if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
    return interaction.reply('You do not have permission to mute members.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  for (const [memberID, member] of voiceChannel.members) {
    try {
      await member.voice.setMute(true);
      console.log(`Muted ${member.user.tag}`);
    } catch (error) {
      console.error(`Could not mute ${member.user.tag}:`, error);
    }
  }

  interaction.reply('All members in the voice channel have been muted.');
};

const unmuteAll = async (interaction) => {
  if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
    return interaction.reply('You do not have permission to unmute members.', { ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply('You need to be in a voice channel to use this command.', { ephemeral: true });
  }

  for (const [memberID, member] of voiceChannel.members) {
    try {
      await member.voice.setMute(false);
      console.log(`Unmuted ${member.user.tag}`);
    } catch (error) {
      console.error(`Could not unmute ${member.user.tag}:`, error);
    }
  }

  interaction.reply('All members in the voice channel have been unmuted.');
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return; // Only respond to slash command interactions
    
    try {
      const { commandName } = interaction;
  
      if (commandName === 'muteall') {
        await muteAll(interaction);
      } else if (commandName === 'unmuteall') {
        await unmuteAll(interaction);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
      }
    }
  });

client.on('messageCreate', async message => {
  if (!message.content.startsWith(commandPrefix) || message.author.bot) return;

  const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'muteall') {
    await muteAll(message);
  } else if (command === 'unmuteall') {
    await unmuteAll(message);
  }
});

client.login(token);
