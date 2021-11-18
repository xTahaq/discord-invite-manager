const { MessageEmbed } = require("discord.js")
const {prefix} = require("../../config.js")
module.exports = {
    name: "help",
    aliases: ["h"],
    category: "info",
    description: "Gives list of commands",
    usage: "help <command>",
    cooldowns: new Map(),
    cooldown: 5,
    run: async (client, message, args) => {
        if (args[0]) {
            return getCMD(client, message, args[0]);
        } else {
            return getAll(client, message);
        }
    }
}


function getAll(client, message) {
    const embed = new MessageEmbed()
    embed.setColor("GREEN")
    const commands = (category) => {
        return client.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `\`${cmd.name}\``)
            .join(" ");
    }
    client.categories
    //.map(cat => stripIndents`------------------- **${cat[0].toUpperCase() + cat.slice(1)}** ------------------- \n${commands(cat)}`)
    //.reduce((string, category) => string + "\n" + category);
    .map(cat => {
        embed.addField(cat[0].toUpperCase() + cat.slice(1), commands(cat), false)
    })

    return message.channel.send(embed)
}

function getCMD(client, message, input) {
    const embed = new MessageEmbed()
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `No information found for command **${input.toLowerCase()}**`;

    if (!cmd) {
        return message.channel.send(`No information found for command **${input.toLowerCase()}**`)
    }

    if (cmd.name) info = `**Command name**: ${cmd.name}`;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${a}\``).join(", ")}`;
    if (cmd.description) info +=  `\n**Description**: ${cmd.description}`;
    if (cmd.usage) info += `\n**Usage**: ${prefix}${cmd.usage}`;
    if (cmd.example) info += `\n**Example:** ${cmd.examples}`;
    if (cmd.cooldown) info += `\n**Cooldown:** ${cmd.cooldown} seconds`;
    embed.setDescription(info)
    embed.setFooter("Syntax: [] = required, <> = optional")
    embed.setColor("GREEN")
    return message.channel.send(embed)
}