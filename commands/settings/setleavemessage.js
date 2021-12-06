const {mongodb} = require("../../config.js")
const mongoose = require("mongoose")
mongoose.connect(mongodb, {useNewUrlParser: true, useUnifiedTopology: true})
const Data = require("../../data.js")
module.exports = {
    name: "setleavemessage",
    category: "settings",
    description: "Set a leave message.",
    usage: "setleavemessage [message]",
    requiredPerm: "MANAGE_GUILD",
    cooldowns: new Map(),
    cooldown: 7,
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send("Invalid command usage. Please type a message")
        let lmessage = args.slice().join(" ")
        if (lmessage.length > 1024) return message.channel.send("Leave message cannot be longer than 1024 words.")
        Data.findOne({server:message.member.guild.id}, (err, data) => {
            if (err) return message.channel.send(":warning: Database error: " + err)
            if (!data) {
                const newData = new Data({
                    server: message.member.guild.id,
                    welcomeC: null,
                    leaveC: null,
                    welcomeM: "{user:tag} has joined to the server. Invited by {inviter:tag} [Invite Uses: {invite:uses}]",
                    leaveM: lmessage
                })
                newData.save().catch(err => console.log(err))
                return message.channel.send("Leave message is set: " + lmessage)
            }
            data.leaveM = lmessage
            data.save().catch(err => console.log(err))
            return message.channel.send("Leave message is set: " + lmessage)
        })
    }
}