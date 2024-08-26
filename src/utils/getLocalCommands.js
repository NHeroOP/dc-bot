import getAllFiles from './getAllFiles.js';
import path from 'path'; 
import { fileURLToPath, pathToFileURL } from 'url';


const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

export default async function getLocalCommands(exceptions= []) {
  let localCommands = [];

  const commandCategories = getAllFiles(path.join(__dirname, "..", "commands"), true)

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObj = (await import(pathToFileURL(commandFile))).default;
      
      if (exceptions.includes(commandObj.name)) continue;

      localCommands.push(commandObj);
      
    }
    
  }
  

  
  return localCommands;
}