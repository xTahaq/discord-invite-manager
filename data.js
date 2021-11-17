const mongoose = require("mongoose")

const data = mongoose.Schema({
    server: String,
    welcomeC: String,
    leaveC: String,
    welcomeM: String,
    leaveM: String
})

module.exports = mongoose.model("data", data)