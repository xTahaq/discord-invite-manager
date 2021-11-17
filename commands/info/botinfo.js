const { MessageEmbed } = require("discord.js")
module.exports = {
    name: "botinfo",
    category: "info",
    description: "Info about the bot.",
    usage: "botinfo",
    cooldowns: new Map(),
    cooldown: 10,
    run: async (client, message, args) => {
        guildcount = 0
        usercount = 0
        client.guilds.cache.forEach(g => guildcount++)
        client.users.cache.forEach(u => usercount++)
        now = new Date()
        const embed = new MessageEmbed()
            embed.setTitle("Bot Info - Invite Manager")
            embed.addField("Guilds and Users", guildcount + " Guilds, " + usercount + " Users", false)
            embed.addField("Bot Version", client.version, true)
        message.channel.send(embed)
    }
}