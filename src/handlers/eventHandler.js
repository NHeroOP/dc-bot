import getAllFiles from "../utils/getAllFiles.js";

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

export default function eventHandler(client) {
  
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true)

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b)
    
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    
    
    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = (await import(pathToFileURL(eventFile))).default;
        
        await eventFunction(client, arg)
      }
    })
    
  }

};