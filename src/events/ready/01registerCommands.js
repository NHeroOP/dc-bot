import areCommandsDifferent from '../../utils/areCommandsDifferent.js';
import getApplicationCommands from '../../utils/getApplicationCommands.js';
import getLocalCommands from '../../utils/getLocalCommands.js';
import { data } from '../../../config.js';


export default async function registerCommands(client) {
  try {
    const localCommands = await getLocalCommands()

    const applicationCommands = await getApplicationCommands(client, data.testServer)
    
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;
      

      const existingCommand = await applicationCommands.cache.find(cmd => cmd.name === name)

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`Deleted command: ${name}`)
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options
          })

          console.log(`Edited command: ${name}`);
          
        }
      } else {
        if (localCommand.deleted) {
          console.log(`Command ${name} is already deleted`);
          continue
          
        }

        await applicationCommands.create({
          name, description, options
        })

        console.log(`Created command: ${name}`);
        
      }
    }

  } catch (error) {
    console.log(`There was an error while registering commands: ${error}`)
  }
}