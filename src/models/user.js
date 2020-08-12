const cooldownManager = require('../tools/cooldown')
const waifuManager = require('../tools/waifu')

const mongoose = require('mongoose')

//User model for database
const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
        required: true,
    },
    at: {
        type: String,
        required: true,
    },
    trainCooldown: {
        type: Date,
        required: true,
    },
    fightCooldown: {
        type: Date,
        required: true,
    },
    adventureCooldown: {
        type: Date,
        required: true,
    },
    isekaiCooldown: {
        type: Date,
        required: true,
    },
    combatsWon: {
        type: Number,
        required: true,
    },
    waifu: {
        name: String,
        lastName: String,
        attack: Number,
        defense: Number,
        health: Number,
    },
})

const User = mongoose.model("User", userSchema)

module.exports = User