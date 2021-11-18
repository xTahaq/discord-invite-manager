const { MessageEmbed } = require("discord.js")
const {prefix} = require("../../config.js")
module.exports = {
    name: "settings",
    category: "info",
    description: "Gives you some information about settings commands.",
    usage: "settings",
    requiredPerm: null,
    cooldowns: new Map(),
    cooldown: 15,
    run: async (client, message, args) => {
        const embed = new MessageEmbed()
            embed.setTitle("Settings")
            embed.addField("Introduction", "Hello! Thank you for using this bot. This is a customizable welcomer bot.")
            embed.addField("Setting Up Channels", `You can do '${prefix}setwelcomechannel <channel>' to set your welcome channel.\nYou can do '${prefix}setleavechannel <channel>' to set your leave channel.\nIf you don't want to set a channel, you can type 'remove' instead of channel.`)
            embed.addField("Setting Up Messages", 
            `Use '${prefix}setwelcomemessage' to set a welcome message.
            Use '${prefix}setleavemessage' to set a leave message.
            You can use special functions too! For example:
            {user:name} just joined to the server! Welcome to {guild:name}. (Invited by {inviter:tag}) => Bob just joined to the server! Welcome to Vibing Server. (Invited by Wumpus#6969)`,
            false)
            embed.addField(`Special Functions`, 
            `**{user:name}** - Says the name of the guy who joined or left
            **{user:mention}** - Pings the player who joined or left
            **{user:tag}** - Says the name and tag of the guy who joined or left
            **{inviter:name}** - Says the name of the guy who invited the person
            **{inviter:mention}** - Pings the player who invited the person
            **{inviter:tag}** - Says the name and tag of the guy who invited the person
            **{invite:uses}** - Says how many times the invite was used
            **{guild:users}** - Says the amount of members in this server.
            **{guild:name}** - Says the name of the server.`,
            false)
            message.channel.send(embed).catch(err => new Error(err))
        
    }
}