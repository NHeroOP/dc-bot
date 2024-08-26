import "dotenv/config"
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";

const commands = [
  {
    name: "add",
    description: "Add two numbers",
    options: [
      {
        name: "first_number",
        description: "The first number",
        type: ApplicationCommandOptionType.Number,
        choices: [
          {
            name: "1",
            value: 1
          },
          {
            name: "2",
            value: 2
          },
        ],
        required: true
      },
      {
        name: "second_number",
        description: "The second number",
        type: ApplicationCommandOptionType.Number,
        required: true
      },
      {
        name: "embed",
        description: "Send the result as an embed",
        type: ApplicationCommandOptionType.Boolean,
      },
    ]
  },
]

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);
  
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      {body: commands}
    )
    console.log("Successfully reloaded application (/) commands.");
    
  } catch (error) {
    console.log(error);
    
  }
})();