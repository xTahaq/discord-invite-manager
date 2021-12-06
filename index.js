const { Client, Collection } = require('discord.js');
const {prefix, mongodb, token} = require("./config.js")
const fs = require("fs");
const client = new Client();
client.login(token);
const guildInvites = new Map();
client.version = "v1.1"
const mongoose = require("mongoose")
mongoose.connect(mongodb, {useNewUrlParser: true, useUnifiedTopology: true})
const Data = require("./data.js")
client.categories = fs.readdirSync("./commands/");
client.commands = new Collection();
client.aliases = new Collection();

require("./handler/command.js")(client);

client.on('inviteCreate', async invite => guildInvites.set(invite.guild.id, await invite.guild.fetchInvites()));
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
    client.guilds.cache.forEach(guild => {
        guild.fetchInvites()
            .then(invites => guildInvites.set(guild.id, invites))
            .catch(err => console.log(err));
    });
});

client.on('guildCreate', async guild => {
    guildInvites.set(guild.id, await guild.fetchInvites())
    Data.findOne({server:guild.id}, (err, data) => {
        if (data) return
        if (err) return console.log(err)
        const newData = new Data({
            server: guild.id,
            welcomeC: null,
            leaveC: null,
            welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
            leaveM: "{user:tag} has left the server."
        })
        newData.save().catch(err => console.log(err))
    })
})
client.on('guildDelete', async guild => {
    Data.findOneAndDelete({server:guild.id})
})

client.on('guildMemberAdd', async member => {
    const cachedInvites = guildInvites.get(member.guild.id);
    const newInvites = await member.guild.fetchInvites();
    guildInvites.set(member.guild.id, newInvites);
    try {
        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code).uses < inv.uses);
        Data.findOne({server:member.guild.id}, (err, data) => {
            if (err) console.log(err)
            if (!data) {
                const newData = new Data({
                    server: member.guild.id,
                    welcomeC: null,
                    leaveC: null,
                    welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
                    leaveM: "{user:tag} has left the server."
                })
                newData.save().catch(err => console.log(err))
                return
            }
            if (data.welcomeC === "null") return
            let welcometext = data.welcomeM
            welcometext = welcometext.replace(/{user:name}/g, member.user.username)
            welcometext = welcometext.replace(/{user:tag}/g, member.user.tag)
            welcometext = welcometext.replace(/{user:mention}/g, member.user)
            welcometext = welcometext.replace(/{invite:uses}/g, usedInvite.uses)
            welcometext = welcometext.replace(/{inviter:name}/g, usedInvite.inviter.username)
            welcometext = welcometext.replace(/{inviter:tag}/g, usedInvite.inviter.tag)
            welcometext = welcometext.replace(/{inviter:mention}/g, usedInvite.inviter)
            welcometext = welcometext.replace(/{guild:users}/g, member.guild.members.cache.size)
            welcometext = welcometext.replace(/{guild:name}/g, member.guild.name)
            welcomeChannel = member.guild.channels.cache.find(channel => channel.id === data.welcomeC);
            if(welcomeChannel) {return welcomeChannel.send(welcometext).catch(err => console.log(err));}
        })
    }
    catch(err) {
        Data.findOne({server:member.guild.id}, (err, data) => {
            if (err) console.log(err)
            if (!data) return console.log("WARNING: Data not found for the guild: " + member.guild.name)
            if (data.welcomeC === "null") return
            welcomeChannel = member.guild.channels.cache.find(channel => channel.id === data.welcomeC);
            if(welcomeChannel) {return welcomeChannel.send(`I can't figure out how did **${member.user.tag}** join the server.`).catch(err => console.log(err));}
        })
    }
});
client.on('guildMemberRemove', async member => {
    Data.findOne({server:member.guild.id}, (err, data) => {
        if (err) console.log(err)
        if (!data) {
            const newData = new Data({
                server: member.guild.id,
                welcomeC: null,
                leaveC: null,
                welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
                leaveM: "{user:tag} has left the server."
            })
            newData.save().catch(err => console.log(err))
            return
        }
        if (data.leaveC === "null") return
        let leavetext = data.leaveM
        leavetext = leavetext.replace(/{user:name}/g, member.user.username)
        leavetext = leavetext.replace(/{user:tag}/g, member.user.tag)
        leavetext = leavetext.replace(/{user:mention}/g, member.user)
        leavetext = leavetext.replace(/{guild:users}/g, member.guild.members.cache.size)
        leavetext = leavetext.replace(/{guild:name}/g, member.guild.name)
        leaveChannel = member.guild.channels.cache.find(channel => channel.id === data.welcomeC);
        if(leaveChannel) {return leaveChannel.send(leavetext).catch(err => console.log(err));}
    })
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.member.guild) return;
    //----------------------------------------------------
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.lenght === 0) return;

    let command = client.commands.get(cmd); 
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
        if (command.requiredPerm) {
            if (!message.member.hasPermission(command.requiredPerm)) return message.channel.send("You need this permission to use this command: " + command.requiredPerm)
        }
        //--------COOLDOWN CHECKER----------//

        if (command.cooldowns) {
            getCooldown = command.cooldowns.get(message.author.id)
            if (getCooldown) {
                let cooldownDateWillEndAt;
                cooldownDateWillEndAt = getCooldown.whenEnd
                cooldownDateWillEndAt = cooldownDateWillEndAt - Date.now()
                cooldownDateWillEndAt = Math.floor(cooldownDateWillEndAt / 1000)
                if (cooldownDateWillEndAt < 1) {
                    cooldownDateWillEndAt = "<1"
                }
                message.channel.send(`You have cooldown! Default cooldown for \`${command.name}\` is ${command.cooldown} seconds. You have to wait ${cooldownDateWillEndAt} more seconds.`)
                return;
            }
        } 
        //--------COMMAND RUNNER------------//

        command.run(client, message, args).catch(err => {
            message.channel.send(`**Command:**\n\`\`\`${command.name}\`\`\`\n**Error:**\n\`\`\`${err}\`\`\``)
            console.log("Command error", err)
        })
        
        //COOLDOWN GIVER
        if (!command.cooldown) return;
        if (!command.cooldowns) return;
        let later = new Date();
        later.setSeconds(later.getSeconds() + command.cooldown)
        command.cooldowns.set(message.author.id, {whenEnd: later});
        setTimeout(() => {
            command.cooldowns.delete(message.author.id)
        }, command.cooldown * 1000)
    }
});