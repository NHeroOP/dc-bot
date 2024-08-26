import { ApplicationCommandOptionType, Attachment, AttachmentBuilder, PermissionFlagsBits } from "discord.js";
import "dotenv/config.js"
import axios from 'axios';
import { getEnhancedPrompt } from "../../utils/index.js";

export default {
  name: "imagine",
  description: "Generates an image based on the text provided",
  // devOnly: Boolean,
  // testOnly: Boolean,
  options: [
    {
      name: "prompt",
      description: "The prompt to generate the image from",
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: "type",
      description: "The type of image to generate",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Normal",
          value: "normal"
        },
        {
          name: "Realistic",
          value: "realism"
        },
        {
          name: "Anime",
          value: "anime"
        },
      ]
    },
    {
      name: "prompt-enhancer",
      description: "Whether to enhance the prompt or not",
      type: ApplicationCommandOptionType.Boolean,
      choices: [
        {
          name: "Yes",
          value: true
        },
        {
          name: "No",
          value: false
        }
      ]
    },
  ],
  permissionsRequired: [
    PermissionFlagsBits.Administrator
  ],
  botPermissions: [PermissionFlagsBits.Administrator],

  callback: async (client, interaction) => {
    const originalPrompt = interaction.options.get("prompt")?.value;
    const type = interaction.options.get("type")?.value;
    
    const shouldEnhance = interaction.options.get("prompt-enhancer")?.value;

    let prompt;
    if (shouldEnhance === true || shouldEnhance === undefined) {
      prompt = await getEnhancedPrompt(originalPrompt)
    } 

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
      await interaction.editReply(`Generating image, Please Wait.\n ETA: ${formatTime(elapsedTime)}`);
    };
  
    // Update the reply every second
    const updateInterval = setInterval(updateReplyWithElapsedTime, 1000);

    let response;
    try {
      if (!type || type === "normal") {
        response = await axios.post("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", { "inputs": prompt }, {
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        })
      }
      else if (type === "realism") {
        response = await axios.post("https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora", { "inputs": prompt }, {
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        })
        
      } 
      else if (type === "anime") {
        
        response = await axios.post("https://api-inference.huggingface.co/models/dataautogpt3/FLUX-SyntheticAnime", { "inputs": `${prompt} VHS quality` }, {
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer'
        })
      }
      
      const buffer = Buffer.from(response.data, 'binary');
      const attachment = new AttachmentBuilder(buffer, { name: 'image.png' });

      clearInterval(updateInterval);

      interaction.editReply({ content: `Here's your generated image with the prompt: \n___***Original Prompt***___: *${originalPrompt}*\n___***Enhanced Prompt***___: **${prompt}**\n`, files: [attachment] });
      
    } catch (error) {
      console.log(`An error occured ${error}`);
      clearInterval(updateInterval);
      interaction.editReply("An error occured");
    }
  }
}