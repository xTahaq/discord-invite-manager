const {mongodb} = require("../../config.js")
const mongoose = require("mongoose")
mongoose.connect(mongodb, {useNewUrlParser: true, useUnifiedTopology: true})
const Data = require("../../data.js")
module.exports = {
    name: "setwelcomemessage",
    category: "settings",
    description: "Set a welcome message.",
    usage: "setwelcomemessage [message]",
    requiredPerm: "MANAGE_GUILD",
    cooldowns: new Map(),
    cooldown: 7,
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send("Invalid command usage. Please type a message")
        let wmessage = args.slice().join(" ")
        if (wmessage.length > 1024) return message.channel.send("Welcome message cannot be longer than 1024 words.")
        Data.findOne({server:message.member.guild.id}, (err, data) => {
            if (err) return message.channel.send(":warning: Database error: " + err)
            if (!data) new Error("Guild database not found! Please report this error very quickly!")
            data.welcomeM = wmessage
            data.save().catch(err => console.log(err))
            message.channel.send("Welcome message is set: " + data.welcomeM)
        })
    }
}