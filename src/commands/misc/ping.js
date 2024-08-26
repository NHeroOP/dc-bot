export default {
  name: "ping",
  description: "Pong!",
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object[],

  callback: async (client, interaction) => {
    await interaction.deferReply();
    
    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`Pong! ${ping}ms | websocket: ${client.ws.ping}ms`);
  }
}
