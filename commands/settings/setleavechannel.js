const {mongodb} = require("../../config.js")
const mongoose = require("mongoose")
mongoose.connect(mongodb, {useNewUrlParser: true, useUnifiedTopology: true})
const Data = require("../../data.js")
module.exports = {
    name: "setleavechannel",
    category: "settings",
    description: "Set a channel where leave messages go to.",
    usage: "setleavechannel [channel name/remove]",
    requiredPerm: "MANAGE_GUILD",
    cooldowns: new Map(),
    cooldown: 7,
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send("Invalid command usage. Please type a channel name or 'remove'.")
        targetchannel = message.mentions.channels.first()
        if (!targetchannel) {
            if (args[0] === "remove") {
                Data.findOne({server:message.member.guild.id}, (err, data) => {
                    if (err) return message.channel.send(":warning: Database error: " + err)
                    if (!data) {
                        const newData = new Data({
                            server: guild.id,
                            welcomeC: null,
                            leaveC: "null",
                            welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
                            leaveM: "{user:tag} has left the server."
                        })
                        newData.save().catch(err => console.log(err))
                        return message.channel.send("Setted leave channel: `null`")
                    }
                    data.leaveC = "null"
                    data.save().catch(err => console.log(err))
                    return message.channel.send("Setted leave channel: `null`")
                })
            } else {
                message.channel.send("Invalid command usage. Please mention a channel or type 'remove'.")
            }
        } else {
            Data.findOne({server:message.member.guild.id}, (err, data) => {
                if (err) return message.channel.send(":warning: Database error: " + err)
                if (!data) {
                    const newData = new Data({
                        server: guild.id,
                        welcomeC: null,
                        leaveC: targetchannel.id,
                        welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
                        leaveM: "{user:tag} has left the server."
                    })
                    newData.save().catch(err => console.log(err))
                    return message.channel.send("Setted leave channel: " + args[0])
                }
                data.leaveC = targetchannel.id
                data.save().catch(err => console.log(err))
                return message.channel.send("Setted leave channel: " + args[0])
            })
        }
    }
}