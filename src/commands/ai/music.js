import { ApplicationCommandOptionType, AttachmentBuilder, PermissionFlagsBits } from "discord.js";
import "dotenv/config.js"
import axios from 'axios';

export default {
  name: "music",
  description: "Generates music based on the text provided",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "prompt",
      description: "The prompt to generate the music from",
      required: true,
      type: ApplicationCommandOptionType.String
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.Administrator
  ],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    const prompt = interaction.options.get("prompt")?.value;

    await interaction.deferReply()
    
    const startTime = Date.now()

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
    };

    // Function to update the reply with elapsed time
    const updateReplyWithElapsedTime = async () => {
      const elapsedTime = Date.now() - startTime;
      await interaction.editReply(`Generating music, Please Wait.\n ETA: ${formatTime(elapsedTime)}`);
    };
  
    // Update the reply every second
    const updateInterval = setInterval(updateReplyWithElapsedTime, 1000);

    let response;
    try {
      response = await axios.post("https://api-inference.huggingface.co/models/facebook/musicgen-small", { "inputs": prompt }, {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      })
      
      const buffer = Buffer.from(response.data, 'binary');
      const attachment = new AttachmentBuilder(buffer, { name: 'music.wav' });

      clearInterval(updateInterval);

      interaction.editReply({ content: `Here is your generated Music by <@${interaction.user.id}>\n`, files: [attachment] });
      
    } catch (error) {
      console.log(`An error occured ${error}`);
      clearInterval(updateInterval);
      interaction.editReply("An error occured");
    }
  }
}